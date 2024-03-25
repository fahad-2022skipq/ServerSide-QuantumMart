const express = require('express');
const router = express.Router();
const Order = require('../model/orderModel')
const Cart = require('../model/cartModel')
const Product = require('../model/productModel')
const fetchUser = require('../middleware/fetchUser')

router.post('/placeOrder', async(req, res)=>{
    let success = false;
    const {cartId,userId, name, email, address, phone, products, paymentMethod, itemTotal, shipping, grandTotal } = req.body;
    try{
        // add order details to db
        const order = new Order({userId, name, email, address, phone, products, paymentMethod, itemTotal, shipping, grandTotal}).save()
        // delete ordered items from cart if product is ordered form cart
        if(cartId){
            const delResult = await Cart.findByIdAndDelete(cartId)
        }
      
        success = true;
        res.json({success,cartId,order})
    }catch(error){
        console.log(error.message);
    }
})

router.put('/updateOrderStatus', async (req, res) => {
    const { orderId, status } = req.body;
    let success = false;

    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId },
            { status },
            { new: true }
        );

        if (updatedOrder) {
            success = true;
            res.json({ success, message: 'Order status updated successfully' });
        } else {
            res.status(404).json({ success, message: 'Order not found' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, message: 'Internal server error' });
    }
});

router.post('/getOrder', fetchUser, async(req, res)=>{
    let success = false;
    const userId = req.user.id;
    try{
        const order = await Order.find({userId})
        
        const updatedOrder = await Promise.all(
        order.map(async(data)=>{
            const updatedProducts = await Promise.all(
                data.products.map(async (product)=>{
                let item = await Product.findById(product.productId).select('name images')
                item=item.toObject();
                return{
                    ...product.toObject(),
                    name:item.name,
                    image:item.images[0]
                };
            })
            );
            return {
                ...data.toObject(), 
                products: updatedProducts,
              };
        })
        );
        const sortedOrder = updatedOrder.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
         
        success = true;
        res.json({ success, order: sortedOrder }); 
        // success = true;
        // res.json({success,order:updatedOrder})
    }catch(error){
        console.log(error.message);
    }
})


router.post('/getAllOrder', async(req, res)=>{
    let success = false;
    try{
        const order = await Order.find()
        
        const updatedOrder = await Promise.all(
        order.map(async(data)=>{
            const updatedProducts = await Promise.all(
                data.products.map(async (product)=>{
                let item = await Product.findById(product.productId).select('name images')
                item=item.toObject();
                return{
                    ...product.toObject(),
                    name:item.name,
                    image:item.images[0]
                };
            })
            );
            return {
                ...data.toObject(), 
                products: updatedProducts,
              };
        })
        );
        const sortedOrder = updatedOrder.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
         
        success = true;
        res.json({ success, order: sortedOrder }); 
        // success = true;
        // res.json({success,order:updatedOrder})
    }catch(error){
        console.log(error.message);
    }
})


module.exports = router;