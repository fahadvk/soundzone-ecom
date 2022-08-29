const express = require("express");
const app = require("../../app");
const router = express.Router();
const Category = require("../../models/category");
const subcategory = require("../../models/subcategory");
const { route } = require("../user");
const multer = require("multer");
//const upload = multer({ dest: "public/images/category" });
const adminController = require("../../Controller/adminController");
const categoryController = require("../../Controller/categoryController");
const SubCategery = require("../../models/subcategory");
router.get("/", (req, res) => {
  if (req.session.adminlogin) {
    Category.find((err, docs) => {
      subcategory.find((err, subdocs) => {
        res.render("admin/categories", {
          layout: "admin/adminlayout",
          adminlogged: true,
          data: docs,
          sub: subdocs,
        });
      });
    });
  } else {
    res.redirect("/admin");
  }
});

router.post("/addcategory", (req, res) => {
  categoryController.addcategory(req.body).then((response) => {
    if (response.status) {
      res.redirect("/admin/category");
    } else {
      res.redirect("/addcategory");
    }
  });
});
//edit category
let editingcat;
router.get("/editcategory/:id", async function (req, res) {
  editingcat = await Category.findById(req.params.id);

  res.render("admin/edit-category", {
    layout: "admin/adminlayout",
    adminlogged: true,
    editingcat,
  });
});

router.post("/editcategory/:id", async (req, res) => {
  // editingcat = await Categery.findById(req.params.id);

  categoryController
    .editcategory(editingcat._id, req.body)
    .then((response) => {});
  res.redirect("/admin/category");
});
//Delete Category
router.get("/deletecategory/:id", async function (req, res) {
  await Category.findByIdAndDelete({ _id: req.params.id });
  res.redirect("/admin/category");
});

// router.get("/addsubcategory", (req, res) => {
//   Categery.find((err, docs) => {
//     res.render("admin/add-subcategory", {
//       layout: "admin/adminlayout",
//       data: docs,
//     });
//   });
// });
const filestorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/Subcategories");
  },
  filename: (req, file, cb) => {
    // const ext = file.mimetype.split("/")[1];

    cb(null, new Date().toISOString() + file.originalname);
  },
});
const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: filestorage,
  fileFilter: filefilter,
});

router.post("/addsubcategory", upload.single("image"), (req, res) => {
  console.log(req.file);
  console.log(req.body);
  imagename = req.file.filename;
  categoryController
    .addSubcategory(req.body, imagename, SubCategery)
    .then((response) => {
      if (response.status) {
        res.redirect("/admin/category");
      }
    });
});

router.post("/editsubcategory/:id", async (req, res) => {
  // editingcat = await Categery.findById(req.params.id);

  console.log(editingcat.id);
  categoryController
    .editcategory(editingcat.id, req.body)
    .then((response) => {});
  res.redirect("/admin/category");
});
//Delete SubCategory
router.get("/deletesubcategory/:id", async function (req, res) {
  await subcategory.findByIdAndDelete({ _id: req.params.id });
  res.redirect("/admin/category");
});

module.exports = router;
