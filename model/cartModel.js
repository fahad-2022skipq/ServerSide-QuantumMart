const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      }
    },
  ],
  // Add any other properties you need for the cart.
},
{
  timestamps:true
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;