const {Order} = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const { route } = require('./categories');
const { User } = require('../models/user');
const midtransClient = require('midtrans-client');
const { Market } = require('../models/market');
const router = express.Router();

// =======================================ORDERS WEBSITE========================================== //

// Ambil Status Pending === "3"
router.get(`/:id/listpending`, async (req, res) => {
    try {
        const market = await Market.findById(req.params.id);
        let status = {
            market: market._id,
            status: "3",
        };
        const allOrder = await Order.find(status).populate('user', 'name').populate({
            path: 'orderItems', populate: {
                path : 'product'} 
            }).sort({'dateOrdered':-1});
            if(!allOrder) {
                res.status(500).json({success: false})
            }
            res.send(allOrder);
    } catch (error) {
        res.send(error);
    }
    
})

// Ambil Status Kirim === "2"
router.get(`/:id/listsent`, async (req, res) => {
    try {
        const market = await Market.findById(req.params.id);
        let status = {
            market: market._id,
            status: "2",
        };
        const sentOrder = await Order.find(status).populate('user', 'name').populate({
            path: 'orderItems', populate: {
                path : 'product'} 
            }).sort({'dateOrdered':-1});
            if(!sentOrder) {
                res.status(500).json({success: false})
            }
            res.send(sentOrder);
    } catch (error) {
        res.send(error);
    }
    
    
})

// Ambil Status Selesai === "1"
router.get(`/:id/listdone`, async (req, res) => {
    try {
        const market = await Market.findById(req.params.id);
        let status = {
            market: market._id,
            status: "1",
        };
        const doneOrder = await Order.find(status).populate('user', 'name').populate({
            path: 'orderItems', populate: {
                path : 'product'} 
            }).sort({'dateOrdered':-1});
            if(!doneOrder) {
                res.status(500).json({success: false})
            }
            res.send(doneOrder);
    } catch (error) {
        res.send(error);
    }
    
})



// Konfirmasi Pemesanan
router.put('/konfirmasi/:id', async (req, res) => {    
    const konfirmasiOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: "2",
        },
        { new: true}
    )
    if(!konfirmasiOrder)
    return res.status(400).send('Order Tidak dapat di konfirmasi!')

    res.send(konfirmasiOrder);
})

// Kirim Pemesanan
router.put('/kirim/:id', async (req, res) => {    
    const kirimOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: "1",
        },
        { new: true}
    )
    if(!kirimOrder)
    return res.status(400).send('Order Tidak dapat di kirim!')

    res.send(kirimOrder);
})

// Hapus Data Pesanan Selesai
router.delete('/deleteorder/:id', async (req, res) => {    
    Order.findByIdAndRemove(req.params.id).then(deleteOrder =>{
        if(deleteOrder) {
            return res.status(200).json({success: true, message: 'the market is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "market not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})


//  =========================================ORDERS WEBSITE======================================= //

router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered':-1});

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})



router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.user)
    .populate('user', 'name')
    .populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        });
    
    if(!order) {
        res.status(500).json({success: false})
    } 
    console.log(order)
    res.send(order);
})


router.get('/:id/teset', async(req,res)=>{
    const user = await User.findById(req.params.id);
    const order = await Order.find({ user: user.id })
    let newOrder = {
        userId: user.id,
        address: user.address,
        name: user.name,
        email: user.email,
        phone: user.phone,
        orderId: order[0].id,
    }
    console.log(order.id);
    
    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(newOrder);
})


router.post('/:id', async (req,res)=>{
    const user = await User.findById(req.params.id)
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) =>{
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))
    const orderItemsIdsResolved =  await orderItemsIds;
    
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a,b) => a +b , 0);

        // Create Snap API instance
        let snap = new midtransClient.Snap({
            // Set to true if you want Production Environment (accept real transaction).
            isProduction : false,
            serverKey : 'SB-Mid-server-GwCpjRVG8Bm7izzEFipF9m2D'
        });

        let parameter = {
            "transaction_details": {
                "order_id": orderItemsIdsResolved,
                "gross_amount": totalPrice,
            },
            "credit_card":{
                "secure" : true
            },
            "customer_details": {
                "first_name": user.name,
                "email": user.email,
                "phone": req.body.phone
            }
        };

        const data = await snap.createTransaction(parameter)
            .then(async ( transaction)=>{
                // transaction token
            return transaction
            })


    let order = new Order({
        orderItems: orderItemsIdsResolved,
        address: req.body.address,
        city: req.body.city,
        zip: req.body.zip,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,    
        payment: data.redirect_url,
        user: user.id,
    })
    order = await order.save();
    console.log(order);
    if(!order)
    return res.status(400).send('the order cannot be created!')

    res.send(order);
})


// // Buat Order
// router.post('/buatorder/:id', async (req,res)=>{
//     const user = await User.findById(req.params.id)
//         // Create Snap API instance
//         let snap = new midtransClient.Snap({
//             // Set to true if you want Production Environment (accept real transaction).
//             isProduction : false,
//             serverKey : 'SB-Mid-server-GwCpjRVG8Bm7izzEFipF9m2D'
//         });

//         let parameter = {
//             "transaction_details": {
//                 "order_id": "ID1234",
//                 "gross_amount": order.product.price * order.quantity,
//             },
//             "credit_card":{
//                 "secure" : true
//             },
//             "customer_details": {
//                 "first_name": user.name,
//                 "email": user.email,
//                 "phone": req.body.phone
//             }
//         };

//         const data = await snap.createTransaction(parameter)
//             .then(async ( transaction)=>{
//                 // transaction token
//             return transaction
//             })

//     let order = new Order({
//         product: req.body.product,
//         address: req.body.address,
//         city: req.body.city,
//         zip: req.body.zip,
//         phone: req.body.phone,
//         status: req.body.status,
//         quantity: req.body.quantity,
//         totalPrice: product.price * req.body.quantity,    
//         payment: data.redirect_url,
//         user: user.id,
//     })
//     order = await order.save();
//     console.log(order);
//     if(!order)
//     return res.status(400).send('the order cannot be created!')

//     res.send(order);
// })

router.put('/:id',async (req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true}
    )

    if(!order)
    return res.status(400).send('the order cannot be created!')

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
            path : 'product'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    console.log(userOrderList)
    res.send(userOrderList);
})



module.exports =router;