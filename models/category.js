const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const Categoryschema = new mongoose.Schema(
  {
    //const Categery = mongoose.model("Category", {
    Name: {
      type: String,
      required: true,
      unique: true,
    },
    Description: {
      type: String,
    },
  },
  { timestamps: true }
);
const Categery = mongoose.model("Category", Categoryschema);
module.exports = Categery;

