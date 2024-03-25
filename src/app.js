const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
app.use(cors())
const productRoute = require("../routes/productRoute")
const userRoute = require("../routes/userRoute")
const cartRoute = require("../routes/cartRoute")
const orderRoute = require("../routes/orderRoute")
require('../db/connection')

app.use(express.json())
app.use(productRoute)
app.use(userRoute)
app.use(cartRoute)
app.use(orderRoute)
app.listen(port,()=>{
    console.log(`server started on port ${port}`)
})
