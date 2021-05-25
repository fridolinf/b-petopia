const {Artikel} = require('../../models/artikel');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Market } = require('../../models/market');

// ambil semua data 
router.get(`/`, async (req, res) => {
    
    const artikelList = await Artikel.find();
    try {
        if (!artikelList) {
            res.status(500).json({ success: false })
        }
        res.send(artikelList);
    
    } catch (error) {
    
    }
})


router.post('/tambahArtikel', async (req,res)=>{
    let artikel = new Artikel({
        pertanyaan: req.body.pertanyaan,
        jawaban: req.body.jawaban
    })
    artikel = await artikel.save();

    if(!artikel)
    return res.status(400).send('the artikel cannot be created!')

    res.send(artikel);
})

router.get('/detail/:id', async(req,res)=>{
    
    const artikelDetail = await artikel.findById(req.params.id);
    
    if(!artikelDetail) {
        res.status(500).json({message: 'The artikel with the given ID was not found.'})
        
    } 
    res.status(200).send(artikelDetail);
})


router.delete('/:id', (req, res)=>{
    artikel.findByIdAndRemove(req.params.id).then(artikel =>{
        if(artikel) {
            return res.status(200).json({success: true, message: 'the artikel is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "artikel not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put('/updateartikel/:id',async (req, res)=> {

    const updateartikel = await artikel.findByIdAndUpdate(
        req.params.id,
        {
            pertanyaan: req.body.pertanyaan,
            jawaban: req.body.jawaban,
            
        },
        { new: true}
    )

    if(!updateartikel)
    return res.status(400).send('the artikel cannot be created!')

    res.send(updateartikel);
})



module.exports =router;