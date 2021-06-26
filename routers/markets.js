const {Market} = require('../models/market');
const express = require('express');
const { User } = require('../models/user');
const { Product } = require('../models/product');
const router = express.Router();



router.get(`/`, async (req, res) =>{
    const marketList = await Market.find();

    if(!marketList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(marketList);
})

router.get('/:id', async(req,res)=>{
    const market = await Market.findById(req.params.id);

    if(!market) {
        res.status(500).json({message: 'The market with the given ID was not found.'})
    } 
    res.status(200).send(market);
})


router.post('/', async (req, res) => {
    const user = await User.findById(req.body.user);
    if (!user) return res.status(404).send('Invalid User')
    let market = new Market({
        user: req.body.user,
        marketName: req.body.marketName,
        description: req.body.description
    })
    market = await market.save();

    if(!market)
    return res.status(400).send('the market cannot be created!')

    res.send(market);
})

router.post('/:id', async (req, res) => {
    const user = await User.findById(req.body.user);
    if (!user) return res.status(404).send('Invalid User')
    let market = new Market({
        user: req.body.user,
        marketName: req.body.marketName,
        product: req.body.product,
        description: req.body.description
    })
    market = await market.save();

    if(!market)
    return res.status(400).send('the market cannot be created!')

    res.send(market);
})

router.put('/:id',async (req, res)=> {
    const market = await Market.findByIdAndUpdate(
        req.params.id,
        {
            user: req.body.user,
            marketName: req.body.marketName,
            description: req.body.description
        }
    )
    
    market = await market.save();

    if(!market)
    return res.status(400).send('the market cannot be created!')

    res.send(market);
})

router.delete('/:id', (req, res)=>{
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


router.get(`/get/count`, async (req, res) =>{
    const marketCount = await Market.countDocuments((count) => count)

    if(!marketCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        marketCount: marketCount
    });
})

module.exports =router;