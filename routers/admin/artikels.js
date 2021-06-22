const { Artikel } = require('../../models/artikel');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({ 
    destination: function (req, file, cb){
        const isValid = FILE_TYPE_MAP [file.mimetype];
        let uploadError = new Error('Tipe Image Tidak Sesuai');
        if (isValid){
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    }, 
    filename: function (req, file, cb){
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
})
const uploadOptions = multer({ storage: storage })

// Ambil List Artikel
router.get(`/`, async (req, res) =>{
    const artikelList = await Artikel.find().sort({'dateCreated': -1});

    if(!artikelList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(artikelList);
})

router.get('/:id', async(req,res)=>{
    const artikel = await Artikel.findById(req.params.id);

    if(!artikel) {
        res.status(500).json({message: 'The Artikel with the given ID was not found.'})
    } 
    res.status(200).send(artikel);
})


// buat artikel
router.post(`/tambahartikel`, uploadOptions.single('image'),  async (req, res) =>{
    
    let artikel = new Artikel({
        title: req.body.title,
        description: req.body.description,
        isi: req.body.isi,
        image1: req.body.image1,
    })

    artikel = await artikel.save();

    if(!artikel) 
    return res.status(500).send('The artikel cannot be created')

    res.send(artikel);
})

router.get(`/detail/:id`, async (req, res) =>{
    const artikel = await Artikel.findById(req.params.id)

    if(!artikel) {
        res.status(500).json({success: false})
    } 
    res.send(artikel);
})

router.put('/updateartikel/:id', uploadOptions.single('image'), async (req, res) => {
    
    if(!mongoose.isValidObjectId(req.params.id)) {
       return res.status(400).send('Invalid Artikel Id')
    }
    const artikel = await Artikel.findById(req.params.id);
    if(!artikel) return res.status(400).send('Invalid Artikel');

    const updateArtikel = await Artikel.findByIdAndUpdate(
        req.params.id,
        {
            image1: req.body.image1,
            title: req.body.title,
            description: req.body.description,
            isi: req.body.isi,
        },
        { new: true}
    )

    if(!updateArtikel)
    return res.status(500).send('the Artikel cannot be updated!')

    res.send(updateArtikel);
})

router.delete('/:id', (req, res)=>{
    Artikel.findByIdAndRemove(req.params.id).then(artikel =>{
        if(artikel) {
            return res.status(200).json({success: true, message: 'the category is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "category not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports = router;