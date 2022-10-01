const express = require("express");
const app = require("../../app");
const router = express.Router();
const Category = require("../../models/category");
const subcategory = require("../../models/subcategory");
const { route } = require("../user");
const multer = require("multer");

const adminController = require("../../Controller/adminController");
const categoryController = require("../../Controller/categoryController");
const SubCategery = require("../../models/subcategory");
const AppError = require("../../utils/apperr");
const Products = require("../../models/products");
const Auth = require("../../middlewares/auth")
router.get("/",Auth.Adminlogged, (req, res) => {
  try{
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
  }
  catch(e){
    next(new AppError('Error found While fetching Category',500))
  }
});

router.post("/addcategory", (req, res, next) => {
  categoryController
    .addcategory(req.body)
    .then((response) => {
      if (response.status) {
        res.redirect("/admin/category");
      } else {
        res.redirect("/addcategory");
      }
    })
    .catch((e) => {
      next(new AppError("failed to add category", 500));
    });
});
//edit category
let editingcat;
router.get("/editcategory/:id",Auth.Adminlogged, async function (req, res,next) {
  editingcat = await Category.findById(req.params.id);
if(!editingcat)
{
  next(new AppError("can't find the category",500))
}
  res.render("admin/edit-category", {
    layout: "admin/adminlayout",
    adminlogged: true,
    editingcat,
  });
});

router.post("/editcategory/:id",Auth.Adminlogged, async (req, res, next) => {
  // editingcat = await Categery.findById(req.params.id);

  categoryController
    .editcategory(editingcat._id, req.body)
    .then((response) => {
      res.redirect("/admin/category");
    })
    .catch((e) => {
      next(new AppError("failed editing Category", 500));
    });
});
//Delete Category
router.get("/deletecategory/:id",Auth.Adminlogged, async function (req, res, next) {
  try {
    let flag =await Products.findOne({Category:req.params.id})
    if(!flag){
      await Category.findByIdAndDelete({ _id: req.params.id });
     res.json("Deleted")
    }
    else{
     res.json( `Can't Delete,! its linked with ${flag.Name}`)
   
    }
   
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
    next(new AppError("Error occured while deleting", 500));
  }
});

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
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
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


//Delete SubCategory
router.get("/deletesubcategory/:id",Auth.Adminlogged, async function (req, res, next) {
  try {
   let flag =await Products.findOne({SubCategory:req.params.id})
   if(!flag){
    await subcategory.findByIdAndDelete({ _id: req.params.id });
    res.json("Deleted")
   }
   else{
    res.json( `Can't Delete,! its linked with ${flag.Name}`)
   }
    res.redirect("/admin/category");
  } catch (error) {
    next(new AppError("failed Deletion", 500));
  }
});

module.exports = router;
