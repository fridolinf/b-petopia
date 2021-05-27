const {User} = require('../../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Market } = require('../../models/market');

// ambil semua data user
router.get(`/:filter`, async (req, res) => {
    let filter = {
        isAdmin: req.params.filter
        };
    const userList = await User.find(filter).select('-passwordHash');
    try {
        if (!userList) {
            res.status(500).json({ success: false })
        }
        res.send(userList);
    
    } catch (error) {
    
    }
})


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
    console.log(market.id);
    
    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(newMarket);
})


// ambil semua data verifikasi supplier
router.get(`/verifikasi/:filter`, async (req, res) => {
    const user = await User.findById(req.params.id)
    let filter = {
        statusMarket: req.params.filter, //filter = false
    };
   
    const daftarUserVerifikasi = await Market.find(filter).populate('user');
    try {
        if (!daftarUserVerifikasi) {
            res.status(500).json({ success: false })
        }
        res.send(daftarUserVerifikasi);
    
    } catch (error) {
    
    }
})


//ACC VERIFIKASI SELLER 
router.put('/accseller/:id', async (req, res) => {    
    const market = await Market.findByIdAndUpdate(
        req.params.id,
        {
            statusMarket: true,
        },
        { new: true}
    )
    if(!market)
    return res.status(400).send('the market cannot be created!')

    res.send(market);
})

// Tolak Verifikasi
router.delete('/refuseseller/:id', async (req, res) => {    
    Market.findByIdAndRemove(req.params.id).then(market =>{
        if(market) {
            return res.status(200).json({success: true, message: 'the market is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "market not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
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



module.exports =router;