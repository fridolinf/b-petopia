const mongoose = require('mongoose');

const marketSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image:{
        type: String,  
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
    alamatToko:{
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

marketSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

marketSchema.set('toJSON', {
    virtuals: true,
});


exports.Market = mongoose.model('Market', marketSchema);
