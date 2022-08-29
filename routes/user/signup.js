const express = require("express");
const app = require("../../app");
const router = express.Router();
require("../../models/mongoose");
const expvalidator = require("express-validator");
const User = require("../../models/user");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { body } = require("express-validator");
let duplicate = false;
router.get("/", function (req, res) {
  res.render("user/signup", { duplicate: req.session.duplicateuser });
  req.session.duplicateuser = false;
});
router.post("/", async function (req, res) {
  console.log(req.body);

  const Name = req.body.Name;
  const email = req.body.email;
  const password = req.body.Password;
  const confirmPass = req.body.confirmPass;
  const Mobile = req.body.Mobile;
  User.findOne({ email: email }).then((Userdoc) => {
    if (Userdoc) {
      console.log("user already exsit");
      req.session.duplicateuser = true;

      return res.redirect("/signup");
    }
  });
  const Password = await bcrypt.hash(password, 10);
  console.log(Password);
  const user = new User({
    Name,
    email,
    Mobile,
    Password,
    confirmPass,
  });

  user
    .save()
    .then(() => {
      res.render("user/confirm");
    })
    .catch((e) => {
      console.log(e);
    });
  console.log(req.body);
});

module.exports = router;
