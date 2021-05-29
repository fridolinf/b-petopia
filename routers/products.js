const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { put } = require('./categories');
const { Router } = require('express');
const { Market } = require('../models/market');

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
//
//GET PRODUCTS ALL ->ANDROID
router.get(`/`, async (req, res) =>{
    // localhost:3000/api/v1/products?categories=2342342,234234
   
    let filter = { };
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category')
    .populate('market');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
   
})
router.get(`/:idmarket`, async (req, res) =>{
    const market = await Market.findById(req.params.id)
    let filter = {
        market: market.id
    };
    
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter)
    .populate('category');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})
// DETAIL PRODUCT
router.get(`/:id`, async (req, res) =>{
    const product = await Product.findById(req.params.id)
    .populate('category')
    .populate('market');

    if(!product) {
        res.status(500).json({success: false})
    } 
    res.send(product);
})


//GET PRODUCTS TAB HABISPAKAI
router.get(`/:id/habispakai/`, async (req, res) => {
    const market = await Market.findById(req.params.id)
    let filter = {
        market: market.id,
        tipe: "608d5adf6a3623372c02d48d",
    };

    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})

//GET PRODUCTS TAB Hotel
router.get(`/:id/hotel/`, async (req, res) => {
    const market = await Market.findById(req.params.id)
    // const tipe = await Tipe.findOne({name: "habis pakai"})
    // const tipe = await Tipe.find({_id: ""})
    // const newTipe = await Product.find({ tipe: tipe.id })
//     const category = await Category.find({id: productList.})
//   console.log(category)
    let filter = {
        market: market.id,
        tipe: "608d5b246a3623372c02d48e",
    };
    
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})

//GET PRODUCTS TAB Grooming
router.get(`/:id/grooming/`, async (req, res) => {
    const market = await Market.findById(req.params.id)
    // const tipe = await Tipe.findOne({name: "habis pakai"})
    // const tipe = await Tipe.find({_id: ""})
    // const newTipe = await Product.find({ tipe: tipe.id })
//     const category = await Category.find({id: productList.})
//   console.log(category)
    let filter = {
        market: market.id,
        tipe: "608d5b316a3623372c02d48f",
    };
    
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})


// Tambah Produk pake id market
router.post(`/supplier/tambahproduk/:id`, uploadOptions.single('image'),  async (req, res) =>{
    // const file = req.file;
    // if(!file) return res.status(400).send('File Tidak Ada')
    // const fileName = req.file.filename
    // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new Product({
        market: req.params.id,
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image1: req.body.image1,
        image2: req.body.image2,
        image3: req.body.image3,
        image4: req.body.image4,
        tipe: req.body.tipe,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        // rating: req.body.rating,
        // numReviews: req.body.numReviews,
        // isFeatured: req.body.isFeatured,
    })

    product = await product.save();

    if(!product) 
    return res.status(500).send('The product cannot be created')

    res.send(product);
})

router.put('/supplier/updateproduk/:id', uploadOptions.single('image'),async (req, res)=> {
    if(!mongoose.isValidObjectId(req.params.id)) {
       return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')

    const product = await Product.findById(req.params.id);
    if(!product) return res.status(400).send('Invalid Product');
//  frelly

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image1: req.body.image1,
            image2: req.body.image2,
            image3: req.body.image3,
            image4: req.body.image4,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
        },
        { new: true}
    )

    if(!updatedProduct)
    return res.status(500).send('the product cannot be updated!')

    res.send(updatedProduct);
})


router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id');
        }
        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true }
        );

        if (!product)
            return res.status(500).send('the gallery cannot be updated!');

        res.send(product);
    }
);

// DELETE PRODUK
router.delete('/:id', (req, res)=>{
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product) {
            return res.status(200).json({success: true, message: 'the product is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "product not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get(`/get/count`, async (req, res) =>{
    const productCount = await Product.countDocuments((count) => count)

    if(!productCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        productCount: productCount
    });
})

router.get(`/get/featured/:count`, async (req, res) =>{
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({isFeatured: true}).limit(+count);

    if(!products) {
        res.status(500).json({success: false})
    } 
    res.send(products);
})


module.exports =router;