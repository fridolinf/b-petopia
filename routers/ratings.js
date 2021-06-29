const {Rating} = require('../models/rating');
const express = require('express');
const router = express.Router();
const {Product} = require('../models/product');
const {OrderItem} = require('../models/order-item');
const {Order} = require('../models/order');

// ambil data Rating
router.get(`/rating`, async (req, res) => {
    
    const ratingList = await Rating.find();
    try {
        if (!ratingList) {
            res.status(500).json({ success: false })
        }
        res.send(ratingList);
    
    } catch (error) {
    
    }
})


// Post Rating
router.post('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id)
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


module.exports =router;