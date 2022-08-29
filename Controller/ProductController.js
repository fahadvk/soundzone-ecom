const multer = require("multer");
const { response } = require("../app");
const ProductModel = require("../models/products");
const Category = require("../models/category");
const SubCategory = require("../models/subcategory");
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
    let imagenames = images.map((values) => {
      return values.filename;
    });
    body.Images = imagenames;
    let response = {};
    console.log(body);

    let doc = await ProductModel.findOne({ _id: id });
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
  });
};
exports.findproduct = (id) => {
  return new Promise(async (resolve, reject) => {
    let product = await ProductModel.findOne({ _id: id });
    resolve(product);
  });
};
exports.getall = () => {
  return new Promise(async (resolve, reject) => {
    ProductModel.find({})
      .populate("Category")
      .populate("SubCategory")

      .then((value) => {
        console.log(value);
        let Imagecover = value.map((imgname) => {
          return imgname.Images[0];
        });
        console.log(Imagecover);
        value.Imagecover = Imagecover;
        resolve(value);
      });
  });
};
