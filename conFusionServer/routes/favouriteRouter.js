const express = require("express");
const bodyParser = require("body-parser");
const favourites = require("../models/favourite");
const favouriteRouter = express.Router();
const verifyUser = require("../authenticate").verifyUser;
const cors = require("./cors");

favouriteRouter.use(bodyParser.json());

favouriteRouter.route("/")
    .get(cors.cors, verifyUser, (req, res, next) => {
        console.log("req.user._id: ", req.user._id);
        favourites.find({ user: req.user._id })
            .populate("dishes")
            .populate("user")
            .then(favourites => {
                res.json(favourites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, verifyUser, (req, res, next) => {
        /*
          [
            {"_id": "5bb952eeef1bb1785facd3ac"},
            {"_id":  "5bb95873a2c0d37e3662a2a3"}
          ]
          */
        const newDishes = req.body.map(elem => elem._id); // convert array of objs to array of values ["5bb952", "5bb95"]

        favourites.findOne({ user: req.user._id })
            .then(
                favourite => {
                    if (!favourite) {
                        favourites.create({ user: req.user._id })
                            .then(favourite => {
                                console.log("New favourite created ");
                                const oldDishes = [];
                                let dishes = concatDishes(newDishes, oldDishes);
                                favourite.dishes = dishes;
                                favourite.save()
                                    .then(favourite => {
                                        favourites.findById(favourite._id)
                                            .populate("user")
                                            .populate("dishes")
                                            .then(favourite => {
                                                res.json(favourite);
                                            });
                                    })
                                    .catch(err => {
                                        return next(err);
                                    });
                            })
                            .catch(err => next(err));
                    } else {
                        let oldDishes = favourite.dishes.map(elem => elem.toString());
                        let dishes = concatDishes(newDishes, oldDishes);
                        favourite.dishes = dishes;
                        favourite
                            .save()
                            .then(favourite => {
                                favourites.findById(favourite._id)
                                    .populate("user")
                                    .populate("dishes")
                                    .then(favourite => {
                                        res.json(favourite);
                                    });
                            })
                            .catch(err => {
                                return next(err);
                            });
                    }
                },
                err => next(err)
            )
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, verifyUser, (req, res, next) => {
        res.status(403).end("PUT operation not supported on /favourites");
    })
    .delete(cors.corsWithOptions, verifyUser, (req, res, next) => {
        favourites.deleteOne({ user: req.user._id })
            .then(
                resp => {
                    res.json(resp);
                },
                err => next(err)
            )
            .catch(err => next(err));
    });

favouriteRouter
    .route("/:dishId")
    .get(cors.cors, verifyUser, (req, res, next) => {
        favourites.findOne({ user: req.user._id }).populate("user").populate("dishes")
            .then(
                favourites => {
                    if (!favourites) {
                        return res.json({ exists: false, favourites: favourites });
                    } else {
                        if (favourites.dishes.indexOf(req.params.dishId) < 0) {
                            return res.json({ exists: false, favourites: favourites });
                        } else {
                            return res.json({ exists: true, favourites: favourites });
                        }
                    }
                },
                err => next(err)
            )
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, verifyUser, (req, res, next) => {
        favourites.findOne({ user: req.user._id })
            .then(
                favourite => {
                    if (!favourite) {
                        favourites.create({ user: req.user._id })
                            .then(favourite => {
                                console.log("New favourite created ");
                                favourite.dishes.push(req.params.dishId);
                                favourite
                                    .save()
                                    .then(favourite => {
                                        favourites.findById(favourite._id)
                                            .populate("user")
                                            .populate("dishes")
                                            .then(favourite => {
                                                res.json(favourite);
                                            });
                                    })
                                    .catch(err => {
                                        return next(err);
                                    });
                            })
                            .catch(err => next(err));
                    } else {
                        let oldDishes = favourite.dishes.map(elem => elem.toString());
                        let dishes = concatDishes(newDishes, oldDishes);
                        favourite.dishes = dishes;
                        favourite
                            .save()
                            .then(favourite => {
                                favourites.findById(favourite._id)
                                    .populate("user")
                                    .populate("dishes")
                                    .then(favourite => {
                                        res.json(favourite);
                                    });
                            })
                            .catch(err => {
                                return next(err);
                            });
                    }
                },
                err => next(err)
            )
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, verifyUser, (req, res, next) => {
        res.status(403).end("PUT operation not supported on /favourites/:dishId");
    })
    .delete(cors.corsWithOptions, verifyUser, (req, res, next) => {
        favourites.findOne({ user: req.user._id })
            .then(
                favourite => {
                    if (favourite) {
                        let oldDishes = favourite.dishes.map(elem => elem.toString()); //ObjectId to String
                        let dishes = new Set(oldDishes); // array to set
                        let dishId = req.params.dishId;
                        if (!dishes.has(dishId)) {
                            err = new Error(`Dish  ${dishId}  not found in favourites`);
                            err.status = 404;
                            return next(err);
                        } else {
                            dishes.delete(dishId);
                            dishes = [...dishes]; // convert set to array
                            favourite.dishes = dishes;
                            favourite.save().then(favourite => {
                                favourites.findById(favourite._id)
                                    .populate("user")
                                    .populate("dishes")
                                    .then(favourite => {
                                        res.json(favourite);
                                    });
                            });
                        }
                    } else {
                        err = new Error(`favourites for user  ${req.user._id}  doesn't exist`);
                        err.status = 404;
                        return next(err);
                    }
                },
                err => next(err)
            )
            .catch(err => next(err));
    });

//this function concatenates two arrays into one with unique values

function concatDishes(newDishes, oldDishes) {
    let dishes = newDishes.concat(oldDishes);
    dishes = new Set(dishes);
    console.log("Set(dishes)", dishes);
    dishes = [...dishes];
    return dishes;
}

module.exports = favouriteRouter;