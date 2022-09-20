const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const productSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    Brand: {
      type: String,
    },
    SellingPrice: {
      type: Number,
      required: true,
    },
    Sold: {
      type: Number,
      default: 0,
    },
    Quantity: {
      type: Number,
      default: 0,
    },
    Category: {
      type: ObjectId,
      ref: "Category",
    },
    SubCategory: {
      type: ObjectId,
      ref: "Subcategory",
    },
    Images: {
      type: Array,
      required: true,
    },
    Price: {
      type: Number,
      default: null,
    },
    Specs: {
      type: Object,
    },
  },
  { timestamps: true }
);

const Products = mongoose.model("Product", productSchema);
module.exports = Products;
