const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Market } = require('../models/market');

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
    console.log(market.id);
    
    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(newMarket);
})

//getinfo
router.get('/getinfo/:id', async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
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
    const user = await User.findOne({email: req.body.email})
    const market = await Market.find({ user: user.id })
    console.log(market);
    const secret = process.env.secret;
    try {
        if(!user) {
            return res.status(400).send('The user not found');
        }
    
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
                if (user.isAdmin === "2") {
                    res.status(200).send({status: 200, marketId:market[0].id, userId: user.id, user: user.email , token: token, error: 0, isAdmin: user.isAdmin}) 
               }
                if (user.isAdmin === "3") {
                    res.status(200).send({status: 200, userId: user.id, user: user.email , token: token, error: 0, isAdmin: user.isAdmin}) 
               }
           console.log(market);
        }
        else {
           res.status(500).send({status:500, message: "password atau email salah!", error: 1});
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
router.post('/register', async (req,res)=>{
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
router.post('/register/:id/seller', async (req,res)=>{
    let market = new Market({
        user: req.params.id,
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