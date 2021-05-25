const {Faq} = require('../../models/faq');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Market } = require('../../models/market');

// ambil semua data user
router.get(`/`, async (req, res) => {
    
    const faqList = await Faq.find();
    try {
        if (!faqList) {
            res.status(500).json({ success: false })
        }
        res.send(faqList);
    
    } catch (error) {
    
    }
})


router.post('/tambahFAQ', async (req,res)=>{
    let faq = new Faq({
        pertanyaan: req.body.pertanyaan,
        jawaban: req.body.jawaban
    })
    faq = await faq.save();

    if(!faq)
    return res.status(400).send('the faq cannot be created!')

    res.send(faq);
})

router.get('/detail/:id', async(req,res)=>{
    
    const faqDetail = await Faq.findById(req.params.id);
    
    if(!faqDetail) {
        res.status(500).json({message: 'The faq with the given ID was not found.'})
        
    } 
    res.status(200).send(faqDetail);
})


router.delete('/:id', (req, res)=>{
    Faq.findByIdAndRemove(req.params.id).then(faq =>{
        if(faq) {
            return res.status(200).json({success: true, message: 'the faq is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "faq not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put('/updateFaq/:id',async (req, res)=> {

    const updateFaq = await Faq.findByIdAndUpdate(
        req.params.id,
        {
            pertanyaan: req.body.pertanyaan,
            jawaban: req.body.jawaban,
            
        },
        { new: true}
    )

    if(!updateFaq)
    return res.status(400).send('the faq cannot be created!')

    res.send(updateFaq);
})



module.exports =router;