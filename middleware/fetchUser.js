const jwt = require('jsonwebtoken')
require('dotenv').config();
const jwtSecKey = process.env.JWT_SECRET

const fetchUser = (req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.json({error:'Please authenticate using valid token'});
    }
    try{
    const data = jwt.verify(token,jwtSecKey);
    req.user = data.user; 
    next();
    }
    catch(err){
        console.error(err.message);
        res.json({error:'Please authenticate using valid token'});
    }
}

module.exports = fetchUser;