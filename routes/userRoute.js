const express = require('express')
const router = express.Router()
const User = require('../model/userModel')
const fetchUser = require('../middleware/fetchUser')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtSecKey = process.env.JWT_SECRET

router.post('/getUser',fetchUser ,async(req, res)=>{
    let success = false;
    try {
        let user = await User.findById(req.user.id).select('-password');
        success = true;
        res.json({success,user})
    }catch(err){
        console.log(err.message)
        res.json({success,error:"Something went wrong"})
    }
})

router.post('/login',async function(req, res){
    let success = false;
    try {
        let user = await User.findOne({email: req.body.email});
        if(!user){
            return res.json({success,error:"Invalid email or password"})
        }
        const matchPassword =  await bcrypt.compare(req.body.password,user.password);
        if(!matchPassword){
            return res.json({success,error:"Invalid email or password"})
        }
        const data = {
            user:{
                id:user.id
            }
        }
        const authToken = jwt.sign(data, jwtSecKey)
        success = true;
        res.json({success,authToken,message:`Welcome back`})
    }catch(err){
        res.json({success,error:"Something went wrong"})
    }
})

router.post('/createUser',async(req, res)=>{
    let success = false;
    try {
    let user = await User.findOne({email:req.body.email})
    if (user){
        return res.json({success,error: "Sorry a user with this email already exists"})
    }
    const salt = await bcrypt.genSalt(10)
    const secPassword = await bcrypt.hash(req.body.password,salt)
    user = await User.create({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        password:secPassword,
    })
    const data = {
        user:{
            id:user.id
        }
    }
    const authToken = jwt.sign(data, jwtSecKey)
    success = true;
    res.json({success,authToken,message: `Thanks ${req.body.firstName} for registeration, You will be redirected soon`})
    } catch (err) {
        res.json({success,error:"Some error occurred"})
    }
})

module.exports = router;