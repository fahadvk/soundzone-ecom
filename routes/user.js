var express = require("express");
var router = express.Router();
const twilio = require("../Controller/Twillio");
const mongoose = require("../models/mongoose");
const Admin = require("../models/admin");

const User = require("../models/user");
const bcrypt = require("bcrypt");
const ProductController = require("../Controller/ProductController");
//const { body } = require("express-validator");
//const { check } = require("express-validator/check");

const session = require("express-session");
const Controller = require("../Controller/userController");
const { response } = require("../app");

const adminController = require("../Controller/adminController");
// const Admin = require("../models/admin");
/* GET home page. */
let userlogged = false;
let duplicate = false;
router.get("/", function (req, res, next) {
  ProductController.getall().then((products) => {
    res.render("index", {
      userlogged: req.session.login,
      products,
    });
  });
});
//signup
router.get("/signup", function (req, res) {
  res.render("user/signup", {
    // layout: "",
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

        twilio.getOtp(number);
        res.render("user/confirm");
      } else {
        res.redirect("/signup");
      }
    });
  }
);
router.post("/confirm", (req, res) => {
  number = req.body.otp;
  twilio.checkOtp();
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
router.post("/userlogin", (req, res) => {
  Controller.userlogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.email = response.email;
      req.session.login = true;
      res.redirect("/");
    } else if (response.usernotfound) {
      req.session.usernotfound = true;
      req.session.wrongpassword = false;
      res.redirect("/login");
    } else if (response.blocked) {
      console.log("user is blocked");
      req.session.userblocked = true;
      res.redirect("/login");
    } else {
      console.log("failed");
      req.session.usernotfound = false;
      req.session.wrongpassword = true;
      res.redirect("/login");
    }
  });
});

router.get("/signout", (req, res) => {
  // req.session.destroy();
  req.session.login = false;
  res.redirect("/");
});
router.get("/product-page", (req, res) => {
  ProductController.findproduct("63089cbbe01dda4461b3ceb9").then((product) =>
    res.render("user/product-page", { product })
  );
});
router.get("/cart", (req, res) => {
  res.render("user/cart");
});

module.exports = router;
