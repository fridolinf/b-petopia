const mongoose = require('mongoose');

const marketSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    statusMarket: {
        type: Boolean,
        default: false,
    },
    marketName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    dateCreated: {
        type: String,
        default: Date,
    },
})

marketSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

marketSchema.set('toJSON', {
    virtuals: true,
});


exports.Market = mongoose.model('Market', marketSchema);
