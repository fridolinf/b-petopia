const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    market:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Market',
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default: ''
    },
    image1: {
        type: String,
        default: '',
        required: true
    },
    image2: {
        type: String,
        default: ''
    },
    image3: {
        type: String,
        default: ''
    },
    image4: {
        type: String,
        default: ''
    },
    tipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tipe',
        required: true
    },
    brand: {
        type: String,
        default: ''
    },
    price : {
        type: Number,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    rating: {
        type: Number,
        default: 0,
    },
    avgRating:{
        type: Number,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: String,
        default: Date,
    },
})


productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});


exports.Product = mongoose.model('Product', productSchema);
