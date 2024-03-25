const mongoose = require('mongoose')

const connection = mongoose.connect('mongodb+srv://root:Hp0DPeiFGETflcN5@cluster1.hzooaks.mongodb.net/quantummartdb?retryWrites=true&w=majority').then(()=>{
    console.log("connection with database is successful")
}).catch((err)=>{
    console.log(err)
})

module.exports = connection;
 