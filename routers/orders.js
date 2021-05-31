const {Order} = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const {Product} = require('../models/product');
const {User} = require('../models/user');
const midtransClient = require('midtrans-client');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})

router.get(`/:id`, async (req, res) =>{
    const order = await Order.find({user: req.params.id});

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
})

// router.post('/', async (req,res)=>{
//     const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) =>{
//         let newOrderItem = new OrderItem({
//             quantity: orderItem.quantity,
//             product: orderItem.product
//         })

//         newOrderItem = await newOrderItem.save();

//         return newOrderItem._id;
//     }))
//     const orderItemsIdsResolved =  await orderItemsIds;

//     const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
//         const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
//         const totalPrice = orderItem.product.price * orderItem.quantity;
//         return totalPrice
//     }))

//     const totalPrice = totalPrices.reduce((a,b) => a +b , 0);

//     let order = new Order({
//         orderItems: orderItemsIdsResolved,
//         shippingAddress1: req.body.shippingAddress1,
//         shippingAddress2: req.body.shippingAddress2,
//         city: req.body.city,
//         zip: req.body.zip,
//         country: req.body.country,
//         phone: req.body.phone,
//         status: req.body.status,
//         totalPrice: totalPrice,
//         user: req.body.user,
//     })
//     order = await order.save();

//     if(!order)
//     return res.status(400).send('the order cannot be created!')

//     res.send(order);
// })

// Buat Order
router.post(`/orderproduct`,  async (req, res) =>{
    const user = await User.findById(req.params.user);
    if (!user) return res.status(400).send('Invalid User');

    const product = await Product.findById(req.body.product);
    
    // Create Snap API instance
    let snap = new midtransClient.Snap({
            // Set to true if you want Production Environment (accept real transaction).
            isProduction : false,
            serverKey : 'SB-Mid-server-GwCpjRVG8Bm7izzEFipF9m2D'
        });
    
    let parameter = {
        "transaction_details": {
            "order_id": "YOUR-ORDERID-123456",
            "gross_amount": product.price * req.body.quantity,
        },
        "credit_card":{
            "secure" : true
        },
        "customer_details": {
            "first_name": "bambang",
            "last_name": "pratama",
            "email": req.params.user.email,
            "phone": req.body.phone
        }
    };
    
    const data = await snap.createTransaction(parameter)
        .then(async ( transaction)=>{
            // transaction token
           return transaction
        })
    

    let order = new Order({
        product: req.body.product,
        Address: req.body.Address,
        city: req.body.city,
        zip: req.body.zip,
        phone: req.body.phone,
        quantity: req.body.quantity,
        totalPrice: product.price * req.body.quantity,
        payment: data.redirect_url,
        user: req.body.user,
    })

    order = await order.save();

    if(!order) 
    return res.status(500).send('The product cannot be created')

    res.send(order);
})


router.put('/:id',async (req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true}
    )

    if(!order)
    return res.status(400).send('the order cannot be update!')

    res.send(order);
})


router.delete('/:id', (req, res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success: true, message: 'the order is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "order not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get('/get/totalsales', async (req, res)=> {
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({totalsales: totalSales.pop().totalsales})
})

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.countDocuments((count) => count)

    if(!orderCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        orderCount: orderCount
    });
})

router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})



module.exports =router;