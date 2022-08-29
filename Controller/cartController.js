const Cart = require("../models/cart");
const User = require("../models/user");
const Products = require("../models/products");
let cart = {
  cartitems: [],
  user,
};
module.exports = {
  addtocart: (product, cust) => {
    cart.cartitems.push(product);
  },
};
