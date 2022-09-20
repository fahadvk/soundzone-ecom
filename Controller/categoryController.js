require("mongoose");
const Subcategory = require("../models/subcategory");
const Category = require("../models/category");
const { response } = require("../app");
module.exports = {
  addcategory: (data) => {
    return new Promise(async function (resolve, reject) {
      try {
        let response = {
          status: false,
        };
        const Name = data.name;
        const Description = data.description;
        const Categery = new Category({
          Name,
          Description,
        });
        Categery.save()

          .then(() => {
            response.status = true;
            resolve(response);
          })
          .catch((e) => {
            console.log(e);

            resolve(response);
          });
      } catch (error) {
        reject(e);
      }
    });
  },
  editcategory: (data, update) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {
      filter = data;
      try {
        await Category.findByIdAndUpdate(filter, update, { new: true })
          .then(() => {
            response.status = true;
            resolve(response);
          })
          .catch(() => {
            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  addSubcategory: (data, imagename) => {
    return new Promise(async function (resolve, reject) {
      let response = {
        status: false,
      };
      const Name = data.name;
      const Category = data.Category;
      const Description = data.description;
      const image = imagename;
      const SubCategery = new Subcategory({
        Name,
        Category,
        Description,
        image,
      });
      SubCategery.save({ timestamps: true })

        .then(() => {
          response.status = true;
          resolve(response);
        })
        .catch((e) => {
          console.log(e);

          resolve(response);
        });
    });
  },
  getSubCat: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const SubCats = await Subcategory.find({ Category: id }, "Name");
        resolve(SubCats);
      } catch (error) {
        reject(error);
      }
    });
  },
  editSubcategory: (data, update) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {
      filter = data;
      try {
        await Subcategory.findByIdAndUpdate(filter, update, { new: true })
          .then(() => {
            response.status = true;
            resolve(response);
          })
          .catch(() => {
            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
};
