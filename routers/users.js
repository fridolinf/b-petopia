const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Market } = require('../models/market');
const { Order } = require('../models/order');

// Dashboard

// CHART DATA PEMASUKKAN / PENGHASILAN
router.get(`/:id/datapemasukkan`, async (req, res) => {
    try {
        const market = await Market.findById(req.params.id);
        let filter = {
            market: market._id,
            status: "1",
        };
        console.log(filter, "masuk");
        const allIncome = await Order.find(filter);
        
        // console.log(allOrder, "masuk");
            if(!allIncome) {
                res.status(500).json({status: 500, success: false})
        }
        res.status(200).send({ status: 200, allIncome });
    } catch (error) {
        res.send(error);
    }
    
})

// CHART DATA Penjualan 
router.get(`/:id/datatransaksi`, async (req, res) => {
    try {
        const market = await Market.findById(req.params.id);
        let filter = {
            market: market._id,
            status: "1",
        };
        const allTransactions = await Order.find(filter).populate({ 
            path: 'orderItems', populate: {
                path: 'product', populate: {
                    path: 'category', select:'name'
                }}
            });
        
            if(!allTransactions) {
                res.status(500).json({status: 500, success: false})
        }
        res.status(200).send({ status: 200, allTransactions });
    } catch (error) {
        res.send(error);
    }
    
})

// DASHBOARD

// Edit Supplier
router.put('/editProfile/:id', async (req, res) => {
    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.passwordHash) {
        newPassword = bcrypt.hashSync(req.body.passwordHash, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const userUpdate = await User.findByIdAndUpdate(
        req.params.id,
        {
        address: req.body.address,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash: newPassword,
        },
        { new: true}
    )

    if (!userUpdate)
        return res.status(400).send('the user cannot be created!')
   
    res.send(userUpdate);
})

// Edit Supplier

// detail suppplier
router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');
    const market = await Market.find({ user: user.id })
    let newMarket = {
        userId: user.id,
        isAdmin: user.isAdmin,
        address: user.address,
        name: user.name,
        email: user.email,
        phone: user.phone,
        marketId: market[0].id,
        marketName: market[0].marketName
    }
    
    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(newMarket);
})


router.post('/', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

//get information
//getinfo
router.get('/getinfo/:id', async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})

router.put('/:id',async (req, res)=> {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        { new: true}
    )

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.post('/loginwebsite', async (req,res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        
        const secret = process.env.secret;
        if(!user) {
            return res.status(400).send({status: 400, message:'Email anda belum terdaftar atau belum diverikasi sebagai Pemilik Toko!'});
        }
        const market = await Market.find({ user: user.id })
    
        if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
            
            const token = jwt.sign(
                {
                    userId: user.id,
                    // marketId: market.id,
                    isAdmin: user.isAdmin
                },
                secret,
                { expiresIn: '1d' }
            )
                if (user.isAdmin === "1") {
                    res.status(200).send({status: 200,  userId: user.id, user: user.email , token: token, error: 0, isAdmin: user.isAdmin}) 
               }
                if (user.isAdmin === "2" && market[0].statusMarket === true) {
                    res.status(200).send({status: 200, marketId:market[0].id, userId: user.id, user: user.email , token: token, error: 0, isAdmin: "2"}) 
            }
        }
        else {
           res.status(500).send({status:500, message: "password salah!", error: 1});
        }    
    } catch (error) {
        res.status(404).send({status:404, message:"Page Not Found"});
    }
    
    
})

router.post('/login', async (req,res) => {
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!user) {
        return res.status(400).send('The user not found');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn : '1d'}
        )
       
        res.status(200).send({userId: user.id, user: user.email , token: token}) 
    } else {
       res.status(400).send('password is wrong!');
    }

    
})

// Register user
router.post('/register', async (req, res) => {
    
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        address: req.body.address,
    })
    
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

//REGISTER Supplier 
router.post('/register/:id/seller', async (req, res) => {

    let market = new Market({
        user: req.params.id,
        status: "0",
        marketName: req.body.marketName,
        description: req.body.description,
    })
    market = await market.save();

    if(!market)
    return res.status(400).send('the market cannot be created!')

    res.send(market);
})

router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments((count) => count)

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})


module.exports =router;