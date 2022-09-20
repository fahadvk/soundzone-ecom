require("mongoose");
const Admin = require("../models/admin");
const User = require("../models/user");
const Category = require("../models/category");
const bcrypt = require("bcrypt");
const { response } = require("../app");
const Coupons = require("../models/coupons");
module.exports = {
  adminlogin: (data) => {
    return new Promise(async (resolve, reject) => {
      // let loginstatus = false;
      let response = {
        status: false,
      };
      // console.log(req.body);
      let admin = await Admin.findOne({ username: data.email });
      if (admin) {
        let Password = admin.Password;
        console.log(Password);
        // console.log(req.body.Password);

        bcrypt.compare(data.Password, Password).then((status) => {
          if (status) {
            console.log("success");
            // req.session.adminlogin = true;
            response.status = true;
            resolve(response);
            //res.redirect("/admin");
          } else {
            console.log("no");
            resolve(response);
            //req.session.loginError = true;
            //res.redirect("/");
          }
        });
      } else {
        console.log("failed");
        resolve(response);
        //req.session.loginError = true;
        //res.redirect("/admin");
      }
    });
  },
  // adduser: (data) => {
  //   return new Promise(async (resolve, reject) => {
  //     let response = {
  //       status: false,
  //       userexist: false,
  //       errors: {},
  //     };

  //     const Name = data.Name;
  //     const email = data.email;
  //     const password = data.Password;
  //     const confirmPass = data.confirmPass;
  //     const Mobile = data.Mobile;
  //     User.findOne({ email: email }).then((Userdoc) => {
  //       if (Userdoc) {
  //         console.log("user already exsit");
  //         // req.session.duplicateuser = true;

  //         response.userexist = true;
  //       }
  //     });
  //     const Password = await bcrypt.hash(password, 10);
  //     console.log(Password);
  //     const user = new User({
  //       Name,
  //       email,
  //       Mobile,
  //       Password,
  //       confirmPass,
  //     });

  //     user
  //       .save()
  //       .then(() => {
  //         response.status = true;
  //         resolve(response);
  //         //res.render("user/confirm");
  //       })
  //       .catch((e) => {
  //         console.log(e);
  //         response.errors = e;
  //         resolve(response);
  //       });
  //     //console.log(req.body);
  //   });
  // },
  blockuser: (id) => {
    return new Promise(async function (resolve, reject) {
      try {
        let response = {
          status: false,
        };
        const filter = { _id: id };
        const update = { IsActive: false };
        await User.findByIdAndUpdate(filter, update, { new: true })
          .then(() => {
            (response.status = true), resolve(response);
          })
          .catch(() => {
            resolve(response);
          });
      } catch (error) {
        reject(errro);
      }
    });
  },
  unblockuser: (id) => {
    return new Promise(async function (resolve, reject) {
      try {
        let response = {
          status: false,
        };
        // console.log(response.status);
        const filter = { _id: id };
        const update = { IsActive: true };
        await User.findByIdAndUpdate(
          filter,
          update,

          { new: true }
        )
          .then(() => {
            response.status = true;
            resolve(response);
          })
          .catch(() => {
            resolve(response);
          });
      } catch (error) {
        reject(err);
      }
    });
  },
  viewcoupons:(req,res,next)=>{
    Coupons.find({}).then((data)=>{
    res.render("admin/coupons",{data,layout:"admin/adminlayout"})
})
  },
  addcoupon:(req,res,next)=>{
    Coupons.create(req.body).then(()=>{
      res.redirect("/admin/coupons")
    })
  },
  Deletecoupon:(req,res,next)=>{
    Coupons.findOneAndDelete({id:req.body.id}).then(()=>{
    res.redirect("/admin/coupons")
    })
  }
};
