const express = require("express");
const app = require("../../app");
const router = express.Router();
const multer = require("multer");
const Products = require("../../models/products");
const Category = require("../../models/category");
const SubCategory = require("../../models/subcategory");
const ProductController = require("../../Controller/ProductController");
const AppError = require("../../utils/apperr");
const Auth = require("../../middlewares/auth")
router.get("/",Auth.Adminlogged, (req, res) => {

    Products.find({})
      .populate("Category")
      .populate("SubCategory")
      .then((data) => {
        res.render("admin/products", {
          layout: "admin/adminlayout",
          adminlogged: true,
          products: data,
        });
      });
 
});
router.get("/add-product",Auth.Adminlogged, (req, res) => {
  Category.find((err, data) => {
    SubCategory.find((err, subdata) => {
      res.render("admin/add-product", {
        layout: "admin/adminlayout",
        adminlogged: true,
        data,
        subdata,
      });
    });
  });
});
router.post(
  "/add-product",
  ProductController.uploadproductimage,
  (req, res) => {
    console.log(req.files);
    // console.log(req.body.files);
    ProductController.addproduct(req.body, req.files).then((response) => {
      if (response.status) {
        res.redirect("/admin/product");
      } else {
        res.send("error ocuured");
      }
    });
    // console.log(req.body);
    // ProductController.addproduct(req.body, req.files);
  }
);
router.get("/editproduct/:id",Auth.Adminlogged, (req, res) => {
  Products.findById(req.params.id)
    .populate("Category")
    .populate("SubCategory")
    .then((data) => {
      res.render("admin/edit-product", { data, layout: "admin/adminlayout" });
    });
});
router.post(
  "/edit-product/:id",
  ProductController.uploadproductimage,
  (req, res, next) => {
    console.log(req.body);
    ProductController.editproduct(req.params.id, req.body, req.files)
      .then(() => {
        res.redirect("/admin/product");
      })
      .catch((e) => {
        next(new AppError("Error while editing", 400));
      });
  }
);
router.get("/deleteproduct/:id",Auth.Adminlogged, ProductController.DeleteProduct);

module.exports = router;
