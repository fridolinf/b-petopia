const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const ratingSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    rating:{
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
})


ratingSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

ratingSchema.set('toJSON', {
    virtuals: true,
});

ratingSchema.statics.calcAverageRatings = async function(productId){
    const stats = await this.aggregate([
        {
            $match: {product: productId}
        },
        { 
            $group:{
                _id: '$product', 
                nRating: {$sum : 1},
                avgRating:{$avg : '$rating'}
            }
        }
    ]);
    console.log(stats);
    try {
        await Product.findByIdAndUpdate(stats[0]._id, {
            Quantityrating:stats[0].nRating,
            avgRating:Math.round(stats[0].avgRating)
        }, {useFindAndModify: false});
    } catch (error) {
        console.log(error.message);
    }
};

    ratingSchema.pre('save', function(){
    this.constructor.calcAverageRatings(this.product)
    
});

exports.Rating = mongoose.model('Rating', ratingSchema);
