const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favouriteSchema = new Schema(
    {
        user: {
            type:mongoose.Schema.ObjectId,
            ref: 'User'
        },
        dishes:[{
            type:mongoose.Schema.ObjectId,
            ref: 'Dish'
        }]
    },
    {
        timestamp: true
    }
);

var Favourites = mongoose.model('Favourite', favouriteSchema);

module.exports = Favourites;