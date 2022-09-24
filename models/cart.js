const mongoose = require("mongoose");
const Product = require("./products");
const validator = require("validator");
const { ObjectId } = mongoose.Schema.Types;
const cartschema = new mongoose.Schema(
  {
    User: {
      type: ObjectId,
      required: true,
    },
    Products: [
      {
        Items: {
          type: ObjectId,
          ref: "Product",
          required: true,
          unique: true,
        },
        Qty: {
          type: Number,
          required: true, 
          min:1,
     
        },
      },
    ],
    Total:{
      type:Number,
    },
    Discount:{
      type:Number,
      default:0,
    }

  },
  { timestamps: true }
);
const cart = mongoose.model("cart", cartschema);

module.exports = cart;
