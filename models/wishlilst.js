const mongoose = require("mongoose");
const Product = require("./products");
const { ObjectId } = mongoose.Schema.Types;
const wishlistschema = new mongoose.Schema(
  {
    User: {
      type: ObjectId,
      required: true,
    },
    Products: [
      {
        type: ObjectId,
        ref: "Product",
        required: true,
        unique: true,
      },
    ],
  },
  { timestamps: true }
);
const wishlist = mongoose.model("wishlist", wishlistschema);

module.exports = wishlist;
