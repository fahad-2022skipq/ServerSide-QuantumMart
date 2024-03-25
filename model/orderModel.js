const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name:{
        type:String,
        required: true,
      },
      email:{
        type:String,
        required: true,
      },
      address:{
        type:String,
        required: true,
      },
      phone:{
        type:String,
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
          },
          price: {
            type: Number,
            required: true,
          },
        },
      ],
      paymentMethod:{
        type:String,
        required: true,
      },
      itemTotal:{
        type:Number,
        required: true,
      },
      shipping:{
        type:Number,
        required: true,
      },
      grandTotal:{
        type:Number,
        required: true,
      },
      status:{
        type:String,
        default: "pending"
      }
},
{
  timestamps:true
}
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
