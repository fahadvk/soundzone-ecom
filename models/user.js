const { ValidatorsImpl } = require("express-validator/src/chain");
const mongoose = require("mongoose");
const validator = require("validator");
const { ObjectId } = mongoose.Schema.Types;
const Userschema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: [true, "enter your name"],
    },
    email: {
      type: String,
      required: [true, "enter email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "value must be email"],
    },
    Mobile: {
      type: Number,
      required: [true, "enter the number"],
    },
    Password: {
      type: String,
      required: [true, "enter the Password"],
    },
    confirmPassword: {
      type: String,
    },

    IsActive: {
      type: Boolean,
      default: true,
    },
    Address: {
      type: Array,
    },
    Cart: {
      type: ObjectId,
      ref: "cart",
    },
    Wishlist: {
      type: ObjectId,
      ref: "wishlist",
    },
    Orders: {
      type: ObjectId,
      ref: "orders",
    },

    IsVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", Userschema);
module.exports = User;
