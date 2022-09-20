var express = require("express");
var router = express.Router();
const axios = require("axios");
require("dotenv").config;
const twilio = require("../utils/Twillio");
const jwt = require("jsonwebtoken");
const mongoose = require("../models/mongoose");
const Admin = require("../models/admin");
const cartController = require("../Controller/cartController");
const User = require("../models/user");
const Auth = require("../middlewares/auth");
const Order = require("../models/Order")
const ProductController = require("../Controller/ProductController");
const session = require("express-session");
const Controller = require("../Controller/userController");
let AllCategeries = []
const categoryController = require("../Controller/categoryController");
const AppError = require("../utils/apperr");
const Categery = require("../models/category");
const OrderController = require("../Controller/OrderController");
// const Admin = require("../models/admin");
/* GET home page. */
let UserCart;
let userlogged = false;
let duplicate = false;
router.get("/", function (req, res, next) {
  if (req.session.login) {
    // cartController.findcart(req.session.user).then((doc) => {
    // UserCart = doc;
    // console.log(UserCart.Produtcs);
    // });
  }
  Categery.find()
    .then((Cats) => {
      req.session.Categories = Cats;
      AllCategeries = req.session.Categories;
      ProductController.getall().then((products) => {
        res.render("index", {
          userlogged: req.session.login,
          products,
          UserCart,
          AllCategeries,
          home: true,
        });
      });
    })
    .catch((e) => {
      next(new AppError("error found while loading Items", 404));
    });
});
//signup
router.get("/signup", function (req, res) {
  res.render("user/signup", {
    // layout: "",
    AllCategeries,
    duplicate: req.session.duplicateuser,
  });
  // req.session.duplicateuser = false;
});

router.post(
  "/signup",
  // check("Name").isLength({ min: 5 }).withMessage("must be atleast 5"),
  async function (req, res) {
    Controller.adduser(req.body).then((response) => {
      console.log(response.errors);
      if (response.userexist) {
        console.log("user already exist");
        req.session.duplicateuser = true;

        res.redirect("/signup");
      } else if (response.status) {
        number = response.mobile;
        req.session.number = response.mobile;
        req.session.email = response.email;
        email = response.email;
        twilio.getOtp(number).then(() => {
          res.render("user/confirm");
        });
      } else {
        res.redirect("/signup");
      }
    });
  }
);
router.post("/confirm", (req, res) => {
  otp = req.body.otp;

  let number = req.session.number;
  let email = req.session.email;
  console.log(otp, number);
  twilio.checkOtp(otp, number).then((status) => {
    if (status) {
      User.findOneAndUpdate({ email: email }, { IsVerified: true }).then(() => {
        res.redirect("/login");
      });
    } else {
      res.render("user/confirm");
    }
  });
});
//login
let usernotfound = false;
let wrongpassword = false;
router.get("/login", (req, res) => {
  if (req.session.login) {
    res.redirect("/");
  } else {
    res.render("user/login", {
      usernotfound: req.session.usernotfound,
      wrongpassword: req.session.wrongpassword,
      userstatus: req.session.userblocked,
    });
    req.session.userblocked = false;
    req.session.wrongpassword = false;
    req.session.userblocked = false;
  }
});

router.post("/confirmotp", function (req, res) {
  res.render("user/confirm");
});

// router.get("/", (req, res) => {
//   res.render("admin/login");
// });
//user login
router.post("/userlogin", (req, res,next) => {
  Controller.userlogin(req.body)
    .then((response) => {
      if (response.status) {
        // const token = jwt.sign({ user: response.user }, process.env.JwtSecret, {
        //   expiresIn: process.env.Jwt_Expires,
        // });
        console.log(response.user);
        req.session.user = response.user;
        req.session.email = response.email;
        req.session.cartid = response.Cart;
        req.session.login = true;
        res.redirect(req.session.returnTo || "/");
        delete req.session.returnTo;
      } else if (response.usernotfound) {
        req.session.usernotfound = true;
        req.session.wrongpassword = false;
        res.redirect("/login");
      } else if (response.blocked) {
        console.log("user is blocked");
        req.session.userblocked = true;
        res.redirect("/login");
      } else if (response.unverified) {
        res.render("user/confirm");
      } else {
        console.log("failed");
        req.session.usernotfound = false;
        req.session.wrongpassword = true;
        res.redirect("/login");
      }
    })
    .catch((e) => {
      next(new AppError("error while login", 500));
    });
});

router.get("/signout", (req, res) => {
  // req.session.destroy();
  req.session.user = null;
  req.session.login = false;
  res.redirect("/");
});

router.get("/category/:id", async (req, res, next) => {
  ProductController.getProductsByCat(req.params.id)
    .then((products) => {
      categoryController.getSubCat(req.params.id).then((subs) => {
        // console.log(products.length, subs);
        if (products.length === 0) {
          next(new AppError("No Products found in this category !!", 404));
        }
        res.render("user/Category", { products, subs ,AllCategeries});
      });
    })
    .catch((err) => {
      next(new AppError("error while fetching this Category!!", 404));
    });
});
router.get("/productpage/:id", (req, res, next) => {
  ProductController.findproduct(req.params.id)
    .then((product) => {
      if (!product) {
        next(new AppError("No Products found !", 404));
      }
      res.render("user/product-page", {
        userlogged: req.session.login,
        product,
        AllCategeries,
      });
    })
    .catch((err) => {
      next(new AppError("invalid product  url!!", 404));
    });
});
//Cart

router.get("/cart", Auth.Isauth, cartController.findcart);
router.post("/add-tocart", Auth.Isauth, cartController.addtocart);
router.get("/remove-cartitem/:id", cartController.removefromcart);
router.get("/wishlist", Auth.Isauth, cartController.getwishlist);
router.post("/add-to-wishlist", Auth.Isauth, cartController.addtowishlist);
router.post("/changeQty", cartController.changeQty);
router.post("delete-wish-item",cartController.Removefromwishlist)
//Checkout
router.all("/checkout",Auth.Isauth,OrderController.viewcheckout)
router.post("/add-address",Auth.Isauth,Controller.addAddress)
router.post("/placeorder",Auth.Isauth,OrderController.placeorder)
router.get("/order-confirm/:id",Auth.Isauth,OrderController.orderconfirmation)

// router.post("/verifyPayment",Auth.Isauth,OrderController.verifypayment)
router.get("/myaccount",Auth.Isauth,Controller.viewProfile)
router.get("/myaccount/addresses",Auth.Isauth,Controller.viewAddresses)
router.post("/edit-address",Auth.Isauth,Controller.editaddress)
router.get("/myaccount/orders",Auth.Isauth,OrderController.viewuserOrders)
router.get("/myaccount/account-security",Auth.Isauth,Controller.ProfileSecurity)



module.exports = router;
