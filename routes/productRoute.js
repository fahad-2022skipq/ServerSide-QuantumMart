const express = require("express");
const router = express.Router();
const Product = require("../model/productModel");
require('dotenv').config();
const sharp = require('sharp');
const multer = require("multer"); 
const Aws = require("aws-sdk"); 

const storage = multer.memoryStorage();

const filefilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: filefilter });

const s3 = new Aws.S3({
  accessKeyId: process.env.KEY_ID,
  secretAccessKey: process.env.SECRET_KEY,
});

router.post("/uploadProduct", upload.array("images", 4), async (req, res) => {
  try {
    const files = req.files; // Get the array of uploaded files
    const uploadedImages = [];

    // Process and upload each image
    await Promise.all(
      files.map(async (file, index) => {
        const resizedimg = await sharp(file.buffer).resize(600, 600, {
          fit: sharp.fit.contain,
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 } 
        });

        const params = {
          Bucket: process.env.S3_BUCKET,
          Key: `${Date.now()}-${file.originalname}`, // Customize the Key as needed
          Body: resizedimg,
          ACL: "public-read-write",
          ContentType: "image/jpeg",
        };

        // Upload the image to AWS S3
        const data = await s3.upload(params).promise();

        uploadedImages.push(data.Location);
      })
    );

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      images: uploadedImages, // Use the array of image URLs
      price: req.body.price,
      salePrice: req.body.salePrice,
    });

    const result = await product.save();
    res.json({ success: true, result });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
});


router.get("/getallProducts", async (req, res) => {
  let success = false;
  try {
    const data = await Product.find();
    success = true;
    const sortedOrder = data.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success, data:sortedOrder });
  } catch (error) {
    console.log(error.message);
    res.json({ success, error: error.message });
  }
});

router.post("/searchProducts", async (req, res) => {
  let success = false;
  try {
    const { query } = req.body;
    
    // Construct a regex pattern for loose matching
    const regexPattern = query.split(' ').map(word => `(?=.*${word})`).join('');
    
    // Perform the search using the regex pattern
    const data = await Product.find({ name: { $regex: new RegExp(regexPattern, 'i') } });
    
    success = true;
    res.json({ success,message:`${data.length} ${data.length===1?'item':'items'} found for '${query}'`, data });
  } catch (error) {
    console.log(error.message);
    res.json({ success, error: error.message });
  }
});


router.post("/getProduct", async (req, res) => {
  let success = false;
  const id = req.body.productId;
  try {
    const data = await Product.findOne({_id:id});
    success = true;
    res.json({success, data });
  } catch (error) {
    console.log(error.message);
    res.json({ success, error: error.message });
  }
});


module.exports = router;
