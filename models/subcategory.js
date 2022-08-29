const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const SubCategoryschema = new mongoose.Schema(
  {
    //const SubCategery = mongoose.model("SubCategory", {
    Name: {
      type: String,
      required: true,
    },
    Category: {
      type: ObjectId,
      ref: "Category",
    },
    Description: {
      type: String,
    },

    image: {
      type: String,
    },
  },
  { timestamps: true }
);
const SubCategery = mongoose.model("Subcategory", SubCategoryschema);
module.exports = SubCategery;
