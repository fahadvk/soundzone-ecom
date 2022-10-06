const mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema.Types;
const Product = require("./products");
const Orderschema = new mongoose.Schema({
    User:{
        type:ObjectId,
        required:true,
        ref:"User"
    },
    
    Products : [{
        Items:{
         type:ObjectId,
         ref:"Product"
   },
    Qty:{
        type:Number
    }
    }],
    Paymentmethod:{
        type: String,
        enum:["COD","RazorPay"]
        
      },
      PaymentStatus:{
        type:"String",
        default:"Pending",
        enum:[
            "Pending",
            "Completed",
            "Cancelled",
            "Refunded",
        ]
      },
      SubTotal:{
        type:Number,
      },
      TotalPrice:{
           type:Number
      },
      Discount:{
        type:Number,
        default:0,
      },
      OrderStatus:{
        type:String,
        default:"Pending",
        enum:[
            "Pending",
            "Placed",
            "Shipped",
            "In-transist",  
            "Delivered",
            "Returned",
            "Return-Confirmed",
            "Refunded",
            "Cancelled",
        ]
     
      },
      Address:{
        type:ObjectId,
        ref:"Address"
      }, 
    
  

} , {timestamps:true})

const Orders = new mongoose.model("Orders",Orderschema);
module.exports = Orders;