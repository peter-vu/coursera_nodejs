const express = require('express');
const bodyParser = require('body-parser');

const Promotions = require('../models/Promotions');
var authenticate = require('../authenticate');
const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());

promotionRouter.route('/')
    .get((req, res, next) => {
        Promotions.find({})
            .then((promotions) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotions);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser,(req, res, next) => {
        if(!authenticate.verifyAdmin(req)) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
        Promotions.create(req.body)
            .then((promotion) => {
                console.log('Promotion Created ', promotion);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(authenticate.verifyUser,(req, res, next) => {
        if(!authenticate.verifyAdmin(req)) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete(authenticate.verifyUser,(req, res, next) => {
        if(!authenticate.verifyAdmin(req)) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
        Promotions.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

promotionRouter.route('/:promoId')
    .get((req, res, next) => {
        Promotions.findById(req.params.promoId)
            .then((promotion) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser,(req, res, next) => {
        if(!authenticate.verifyAdmin(req)) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
        res.statusCode = 403;
        res.end('POST operation not supported on /promotions/' + req.params.promoId);
    })
    .put(authenticate.verifyUser,(req, res, next) => {
        if(!authenticate.verifyAdmin(req)) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
        Promotions.findByIdAndUpdate(req.params.promoId, {
            $set: req.body
        }, { new: true })
            .then((promotion) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(authenticate.verifyUser,(req, res, next) => {
        if(!authenticate.verifyAdmin(req)) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
        Promotions.findByIdAndRemove(req.params.promoId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = promotionRouter;