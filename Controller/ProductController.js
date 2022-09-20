const multer = require("multer");
const { response } = require("../app");
const fs = require("fs");
const ProductModel = require("../models/products");
const Category = require("../models/category");
const SubCategory = require("../models/subcategory");
const { isValidObjectId } = require("mongoose");
const { NetworkContext } = require("twilio/lib/rest/supersim/v1/network");
const AppError = require("../utils/apperr");
const filestorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/products");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];

    cb(null, file.fieldname + new Date().toISOString() + file.originalname);
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
exports.uploadproductimage = upload.array("images", 4);
exports.addproduct = (data, productimage) => {
  let imagenames = productimage.map((values) => {
    return values.filename;
  });
  console.log(imagenames);
  let array = [];
  data.Images = imagenames;
  console.log(data);

  return new Promise(async (resolve, reject) => {
    // let Name = data.name;
    let response = { status: false };
    const newProduct = new ProductModel(data)
      .save()

      .then(() => {
        response.status = true;
        resolve(response);
      })
      .catch((e) => {
        console.log(e);
      });
  });
};
exports.editproduct = (id, body, images) => {
  return new Promise(async (resolve, reject) => {
    try {
    
      let imagenames = images.map((values) => {
        return values.filename;
      });
    
      let response = {};
      console.log(body);

      let doc = await ProductModel.findOne({ _id: id });
      if(images.length == 0){
        body.Images = doc.Images;
      }
      else{
      body.Images = imagenames;
      let deletingImages = doc.Images;
      deletingImages.forEach((path) => fs.existsSync(`public/products/${path}`) && fs.unlinkSync(`public/products/${path}`));
        
    }
      doc
        .replaceOne(body)
        .then(() => {
          response.status = true;
          resolve(response);
        })
        .catch(() => {
          reject(e);
        });
      // doc = body;

      // await doc.save();
      
    } catch (error) {
      reject(error);
    }
  });
};
exports.findproduct = (id) => {
  // console.log(id);
  return new Promise(async (resolve, reject) => {
    try {
      const product = await ProductModel.findById(id);
      resolve(product);
    } catch (err) {
      reject(err);
    }
  });
};
exports.getall = () => {
  return new Promise(async (resolve, reject) => {
    try {
      ProductModel.find({})
        .populate("Category")
        .populate("SubCategory")

        .then((value) => {
          // console.log(value);
          let Imagecover = value.map((imgname) => {
            return imgname.Images[0];
          });
          // console.log(Imagecover);
          value.Imagecover = Imagecover;
          resolve(value);
        });
    } catch (error) {
      reject(error);
    }
  });
};
exports.getProductsByCat = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const products = await ProductModel.find(
        { Category: id },
        "-Description -Specs -Quantity"
      ).populate("Category", "Name");
      resolve(products);
    } catch (e) {
      reject(e);
    }
  });
};
exports.DeleteProduct = async (req, res, next) => {
  try {
    let DeletingProd = await ProductModel.findById(req.params.id);
    var files = DeletingProd.Images;
    // console.log(files);
    let images = files.map((val) => {
      val = `public/products/${val}`;
      return val;
    });
    console.log(images);
    images.forEach((path) => fs.existsSync(path) && fs.unlinkSync(path));
    await ProductModel.findByIdAndDelete(req.params.id);
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
    next(new AppError("Error While Deleting product"));
  }
};
