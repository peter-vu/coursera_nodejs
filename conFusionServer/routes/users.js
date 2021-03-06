const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/users');
const authenticate = require('../authenticate');
const usersRouter = express.Router();
const cors = require('./cors');
const passport = require('passport');

usersRouter.use(bodyParser.json());

/* GET users listing. */
usersRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // if (!authenticate.verifyAdmin(req)) {
    //   var err = new Error('You are not authorized to perform this operation!');
    //   err.status = 403;
    //   return next(err);
    // }
    User.find({})
      .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
      }, (err) => next(err))
      .catch((err) => next(err));
    // res.send('respond with a resource');
  });
// router.get('/', (authenticate.verifyUser, (req, res, next) => {
//   if (!authenticate.verifyAdmin(req)) {
//     var err = new Error('You are not authorized to perform this operation!');
//     err.status = 403;
//     return next(err);
//   }
//   User.find({})
//     .then((users) => {
//       res.statusCode = 200;
//       res.setHeader('Content-Type', 'application/json');
//       res.json(users);
//     }, (err) => next(err))
//     .catch((err) => next(err));
//   // res.send('respond with a resource');
// }));

usersRouter.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      }
      else {
        if (req.body.firstname)
          user.firstname = req.body.firstname;
        if (req.body.lastname)
          user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' });
          });
        });
      }
    });
});

usersRouter.post('/login',cors.corsWithOptions,  passport.authenticate('local'), (req, res) => {

  var token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});

usersRouter.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    // next(err);
    res.redirect('/');
  }
});

usersRouter.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  console.log("req", req);
  console.log("res", res);
  if (req.user) {
    console.log("==> facebook-token successfullly.")
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

module.exports = usersRouter;
