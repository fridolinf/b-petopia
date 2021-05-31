const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    Address: {
        type: String,
        required: true,
    },
    city:{
        type: String,
        required: true,
    },
    zip:{
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required: true,
    },
    status:{
        type: String,
        required: true,
        default: 'pending',
    },
    quantity: {
        type: Number,
        required: true
    },
    totalPrice:{
        type: Number,
    },
    payment: {
        type: String,
        required: false,

    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },

})

orderSchema.virtual('id').get(function (){
    return this._id.toHexString();
});
orderSchema.set('toJSON', {
    virtuals: true,
});


exports.Order = mongoose.model('Order', orderSchema);
