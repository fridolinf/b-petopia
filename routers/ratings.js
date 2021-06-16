const {Rating} = require('../models/rating');
const express = require('express');
const router = express.Router();
const {Product} = require('../models/product');
const {OrderItem} = require('../models/order-item');
const {Order} = require('../models/order');

router.get('/get/totalavg/:id', async (req, res)=> {
    const product = await Product.find({product : req.params.id})
    const rating = await Rating.aggregate([
        { $group: { _id: product.id , rating : { $avg : '$rating'}}}
    ])
    console.log(product.id, rating)
    if(!rating) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({rating: rating.pop().rating})
})
//Post Rating
router.post('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id)
    // const order = await OrderItem.find({product: product.id})
    // console.log(order)
    let rating = new Rating({
        product: product.id,
        user: req.body.user,
        rating: req.body.rating
    })
    // console.log(order.id);
    rating = await rating.save();
    // console.log(rating)
    if(!rating)
    return res.status(400).send('the rating cannot be created!')

    res.send(rating);
})

router.put('/:id',async (req, res)=> {
    
    const order = await Order.findByIdAndUpdate(req.params.id,{status: req.body.status},{ new: true}).populate({ 
        path: 'orderItems', populate: {
            path : 'product' } 
        })

    if(!order)
    return res.status(400).send('the order cannot be created!')
        console.log(order)
    res.send(order);
})

// router.put('/:id',async (req, res)=> {
//     const category = await Category.findByIdAndUpdate(
//         req.params.id,
//         {
//             name: req.body.name,
//             icon: req.body.icon || category.icon,
//             color: req.body.color,
//         },
//         { new: true}
//     )

//     if(!category)
//     return res.status(400).send('the category cannot be created!')

//     res.send(category);
// })
//jumlah user merating
// router.get(`/get/count`, async (req, res) =>{
//     const productCount = await Product.countDocuments((count) => count)
//     const totaluser = await User.find(req.params.user)

//     if(!productCount) {
//         res.status(500).json({success: false})
//     } 
//     res.send({
//         productCount: productCount
//     });
// })

module.exports =router;