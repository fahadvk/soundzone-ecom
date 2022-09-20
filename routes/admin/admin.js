const express = require("express");
const app = require("../../app");
const router = express.Router();
const mongoose = require("../../models/mongoose");
const Admin = require("../../models/admin");
const User = require("../../models/user");
const Categery = require("../../models/category");
const userController = require("../../Controller/userController");
const adminController = require("../../Controller/adminController");
const OrderController = require("../../Controller/OrderController")
const Swal = require("sweetalert2");
const Auth = require("../../middlewares/auth")
const { response } = require("../../app");
const {
  LogContext,
} = require("twilio/lib/rest/serverless/v1/service/environment/log");
const AppError = require("../../utils/apperr");
let adminlogged = false;

router.get("/", (req, res) => {
  if (req.session.adminlogin) {
    res.render("admin/home", {
      layout: "admin/adminlayout",
      adminlogged: req.session.adminlogin,
    });
  } else {
    res.render("admin/login", {
      layout: "admin/adminlayout",
      adminlogged: req.session.adminlogin,
    });
  }
});
//
router.post("/login", (req, res) => {
  adminController.adminlogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminlogin = true;

      res.redirect("/admin");
    } else {
      //console.log("no");

      req.session.loginError = true;
      res.redirect("/admin");
    }
  });
});

// router.get("/home", (req, res) => {
//   if (req.session.adminlogin) {
//     res.render("admin/home", {
//       layout: "admin/layout",
//       adminlogged: req.session.adminlogin,
//     });
//   } else {
//     res.redirect("/admin");
//   }
// });
//user management page
router.get("/users",Auth.Adminlogged, (req, res) => {
    User.find((err, docs) => {
      res.render("admin/userdata", {
        layout: "admin/adminlayout",

        adminlogged: true,
        user: docs,
      });
    });
 
});
//add user
router.get("/adduser",Auth.Adminlogged, (req, res) => {
 
    res.render("admin/adduser", { layout: "admin/adminlayout" });

});
router.post("/adduser", (req, res) => {
  userController.adduser(req.body).then((response) => {
    if (response.userexist) {
      res.redirect("/adduser");
    } else if (response.status) {
      console.log("user added");

      res.redirect("/admin");
    } else {
      res.render("admin/adduser", {
        layout: "admin/adminlayout",
        userexist: response.userexist,
      });
    }
  });
});
//block
router.get("/blockuser/:id", Auth.Adminlogged,(req, res, next) => {
  console.log(req.params.id);
  adminController
    .blockuser(req.params.id)
    .then((response) => {
      if (response.status) {
        console.log("blocked");

        res.redirect("/admin/users");
      }
    })
    .catch((err) => {
      next(new AppError("Error while blocking", 500));
    });
});
//unblock user
router.get("/unblockuser/:id",Auth.Adminlogged,(req, res) => {
  console.log(req.params.id);
  adminController
    .unblockuser(req.params.id)
    .then((response) => {
      console.log(response);
      if (response.status) {
        console.log("unblocked");
        req.session.activeuser = true;

        res.redirect("/admin/users");
      }
    })
    .catch((err) => {
      next(new AppError("Unblocking failed", 500));
    });
});
router.post("/verifyPayment",Auth.Isauth, OrderController.verifypayment)
router.get("/coupons",adminController.viewcoupons)
router.post('/addcoupon',adminController.addcoupon)
router.post('/deletecoupon',adminController.Deletecoupon)
router.get("/orders",OrderController.getallorders)

// logout
router.get("/logout", (req, res) => {
  req.session.adminlogin = false;
  // req.session.destroy();
  res.redirect("/admin");
});
module.exports = router;
