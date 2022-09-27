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
    Category:{
      type:String,
      enum:[
        "All New Users",
        "All Current Users",
        "AllUser",
        

      ]
    },
    Discount:{
        type:Number,
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
