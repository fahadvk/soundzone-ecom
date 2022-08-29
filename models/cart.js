const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const cartschema = new cartschema(
  {
    User: {
      type: ObjectId,
      required: true,
    },
    Product: {
      type: Array,
      required: true,
    },
    Qty: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);
cartschema.methods.addtocart = (product, customer) => {};
const cart = mongoose.model("cart", cartschema);
module.exports = cart;
