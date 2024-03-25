const express = require('express');
const router = express.Router();
const Cart = require('../model/cartModel');
const Product = require('../model/productModel');
const fetchUser = require('../middleware/fetchUser')

// Display cart Items w.r.t user
router.post('/getCart', async(req, res) =>{
  let success = false;
  const {userId} = req.body;
  const data = []
  try{
    const cart = await Cart.find({userId});
    if(cart.length==0){
      return res.json({success, "message": "Cart is empty"})
    }
      await Promise.all(cart[0].products.map(async (obj) => {
        let item = await Product.findById(obj.productId);
        item = item.toObject();
        data.push({
          id: item._id,
          name: item.name,
          image: item.images[0],
          price: item.price,
          salePrice: item.salePrice,
          quantity: obj.quantity,
          date: obj.createdAt
        });
      }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date))

    success = true;
    res.json({success, "id":cart[0].id, "products":data});
  }catch(e){
    console.error('Error :', e.message);
  }
});

// Display all cart Items 
router.get('/getAllCartItems', async(req, res) =>{
  let success = false;
  try{
    const cart = await Cart.find().sort({ createdAt: 1 })
    success = true;
    res.json({success,cart})
  }catch(e){
    console.error('Error :', e.message);
  }
})

// Delete item from cart
router.delete('/deleteItem', async (req, res) => {
  let success = false;
  try {
    const { id, productId } = req.body;
    // Find the cart by ID
    const cart = await Cart.findById(id);
    console.log(cart);
    if (!cart) {
      console.log("Cart not found")
      return res.json({ success, message: 'Cart not found' });
    }

    // Remove the product from the cart
    cart.products = cart.products.filter((product) => !product.productId.equals(productId));

    // Save the updated cart
    await cart.save();

    success = true;
    res.json({ success, message: 'Item removed' });
  } catch (error) {
    console.error('Error deleting product from cart:', error.message);
    success = false;
    res.status(500).json({ success, message: 'Internal Server Error' });
  }
});


// reduce cart item quantity
router.post('/reduceQuantity', async(req, res)=>{
  let success = false;
  try{
    const {id, productId} = req.body;
    const cart = await Cart.findById(id);
    cart.products.find((product) =>
    {
    if(product.productId.equals(productId)){
      if(product.quantity===1){
        return res.status(200).json({"success": true,"message": "Quantity mustbe alteast 1"})
      }
          product.quantity -= 1
     }
    }
   );
    await cart.save();
    success = true
    res.json({success,"message":"quantity successfully reduced"})
  }catch(e){
    console.error('Error reducing quantity:', e.message);
  }
})

// increase cart item quantity
router.post('/increaseQuantity', async(req, res)=>{
  let success = false;
  try{
    const {id, productId} = req.body;
    const cart = await Cart.findById(id);
    const product = cart.products.find((product) =>
    product.productId.equals(productId)
   );
    product.quantity += 1
    await cart.save();
    success = true
    res.json({success,"message":"quantity successfully increased"})
  }catch(e){
    console.error('Error increasing quantity:', e.message);
  }
})

// Route to add a product to the cart
router.post('/addToCart',fetchUser, async (req, res) => {
  let success = false;
  const {productId, quantity } = req.body;
  const user = req.user.id;
  try {
    // Check if the user already has a cart
    let cart = await Cart.findOne({ userId:user });
    if (!cart) {
      cart = new Cart({ userId:user, products: [] });
    }
    // Check if the product is already in the cart
    const existingProduct = cart.products.find((product) =>
        product.productId.equals(productId)
    );
    if (existingProduct) {
      // If the product is already in the cart, update the quantity
      existingProduct.quantity += quantity;
    } else {
      // If the product is not in the cart, add it
      cart.products.push({ productId, quantity });
    }
  

    // Save the updated cart
    await cart.save();
    success = true;
    res.json({ success, message: 'Product added to cart successfully' });
  } catch (error) {
    console.error('Error adding product to cart:', error.message);
    success = false;
    res.status(500).json({ success, message: 'Internal Server Error' });
  }
});


module.exports = router;
