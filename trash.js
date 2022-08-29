const userModel = require("models/user");
const { checkout } = require("/routes/admin");

let config = {
  serviceid: "MG1dc21fcd31ecfac1e6aa54f33919de1b",
  accountSID: "ACbea53b18d3e1f3dbdf4c92da9d32de26",
  authToken: "69359784e53efb493d18c31e7842a38f",
};

const client = require("twilio")(config.accountSID, config.authToken);

module.exports = {
  getOtp: (number) => {
    return new Promise(async (resolve, reject) => {
      let user = await userModel.findOne({ phonenuumber: number });
      let response = {};

      if (user) {
        response.exist = true;
        if (!user.ActiveStatus) {
          client.verify.v2
            .services(config.serviceid)
            .verifications.create({
              to: "+91" + number,
              channel: "sms",
            })
            .then((data) => {
              console.log("response");
              response.data = data;
              response.user = user;
              (response.email = user.email = user.email),
                (response.ActiveStatus = true);
              resolve(response);
            })
            .catch((err) => {
              console.log("ERROR FOUND AT VERIFICATIION"), reject(err);
            });
        } else {
          response.userBlocker = true;
          resolve(response);
        }
      } else {
        (response.exist = false), resolve(response);
      }
    });
  },

  checkOut: (otp, number) => {
    let phonenuumber = "+91" + number;
    return new Promise((resolve, reject) => {
      client.verify.v2
        .services(config.serviceid)
        .verificationChecks.create({
          to: phonenuumber,
          code: otp,
        })
        .then((verification_check) => {
          console.log(verification_check.status);
          console.log("verification success");
          resolve(verification_check.status);
        })
        .catch((err) => {
          console.log("error", err);
        });
    });
  },
};
//for category
//category
// router.get("/category", (req, res) => {
//   if (req.session.adminlogin) {
//     Categery.find((err, docs) => {
//       res.render("admin/categories", {
//         layout: "admin/adminlayout",
//         adminlogged: true,
//         data: docs,
//       });
//     });
//   } else {
//     res.redirect("/admin");
//   }
// });
////
//addcategory
// router.get("/addcategory", (req, res) => {
//   res.render("admin/add-category", {
//     layout: "admin/adminlayout",
//     adminlogged: true,
//   });
// });

// router.post("/addcategory", (req, res) => {
//   adminController.addcategory(req.body).then((response) => {
//     if (response.status) {
//       res.redirect("/admin/category");
//     } else {
//       res.redirect("/addcategory");
//     }
//   });
// });
// //edit category
// let editingcat;
// router.get("/editcategory/:id", async function (req, res) {
//   editingcat = await Categery.findById(req.params.id);
//   res.render("admin/edit-category", {
//     layout: "",
//     adminlogged: true,
//     editingcat,
//   });
// });
// router.post("/editcategory/:id", async (req, res) => {
//   // editingcat = await Categery.findById(req.params.id);
//   console.log(editingcat.id);
//   adminController.editcategory(editingcat.id, req.body).then((response) => {});
//   res.redirect("/admin/category");
// });
// //Delete Category
// router.get("/deletecategory/:id", async function (req, res) {
//   await Categery.findByIdAndDelete({ _id: req.params.id });
//   res.redirect("/admin/category");
// });
