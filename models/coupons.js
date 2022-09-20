const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const User = require("./user")
const Couponschema = new mongoose.Schema(
  {
    
    Name: {
      type: String,
      required: true,
    },
    CouponCode: {
      type: String,
      required:true
    },
    Description: {
      type: String,
    },
    Discount:{
        type:String,
    },
    MaxDiscount:{
        type:Number
    },
    Minamount:{
        type:Number
    },

    ActiveUsers: [{
      type: ObjectId,
      ref:"User"
    }],
  AvailedUsers:[{
    type:ObjectId,
    ref:"User" 
   }]

  },
  { timestamps: true }
);
const Coupons = mongoose.model("Coupons", Couponschema);
module.exports = Coupons;
