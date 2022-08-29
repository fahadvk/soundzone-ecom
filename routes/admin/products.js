const express = require("express");
const app = require("../../app");
const router = express.Router();
const multer = require("multer");
const Products = require("../../models/products");
const Category = require("../../models/category");
const SubCategory = require("../../models/subcategory");
const ProductController = require("../../Controller/ProductController");
const ProductModel = require("../../models/products");

router.get("/", (req, res) => {
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
router.get("/add-product", (req, res) => {
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
router.get("/editproduct/:id", (req, res) => {
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
  (req, res) => {
    console.log(req.body);
    ProductController.editproduct(req.params.id, req.body, req.files).then(
      () => {
        res.redirect("/admin/product");
      }
    );
  }
);
router.get("/deleteproduct/:id", async (req, res) => {
  await ProductModel.findByIdAndDelete(req.params.id);

  res.redirect("/admin/product");
});

module.exports = router;
