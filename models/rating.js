const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    rating:{
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
})


ratingSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

ratingSchema.set('toJSON', {
    virtuals: true,
});

exports.Rating = mongoose.model('Rating', ratingSchema);
