require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Address = require("../models/Address");
const AppError = require("../utils/apperr");

module.exports = {
  userlogin: (logindata) => {
    return new Promise(async (resolve, reject) => {
      //let loginstatus = false;
      let response = {
        status: false,
        usernotfound: false,
        blocked: false,
      };
      try {
        let user = await User.findOne({ email: logindata.email });

        if (user) {
          let Password = user.Password;
          let userstatus = user.IsActive;
          if (userstatus === false) {
            response.blocked = true;
            resolve(response);
          }
          if (user.IsVerified == false) {
            response.unverified = true;
            resolve(response);
          }

          console.log(Password);
          // console.log(req.body.Password);
          bcrypt.compare(logindata.Password, Password).then((status) => {
            if (status) {
              console.log("success");
              response.status = "true";
              response.user = user;
              response.Cart = user.Cart;
              response.email = user.email;

              resolve(response);
            } else {
              console.log("no");
              resolve(response);
              // resolve({ status: false });
              // req.session.loginError = true;
              //res.redirect("/");
            }
          });
        } else {
          console.log("failed");
          response.usernotfound = true;
          resolve(response);
          // resolve({ status: false });
          //req.session.loginError = true;
          // res.redirect("/");
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  adduser: (data) => {
    return new Promise(async (resolve, reject) => {
      let response = {
        status: false,
        userexist: false,
        errors: {},
      };

      const Name = data.Name;
      const email = data.email;
      const password = data.Password;
      const confirmPass = data.confirmPass;
      const Mobile = data.Mobile;
      User.findOne({$or:[{ email: email },{Mobile:Mobile} ]}).then((Userdoc) => {
        if (Userdoc) {
          console.log("user already exsit");
          // req.session.duplicateuser = true;

          response.userexist = true;
          resolve(response);
        }
      });
      
      const Password = await bcrypt.hash(password, 10);
      console.log(Password);
      const user = new User({
        Name,
        email,
        Mobile,
        Password,
        confirmPass,
      });

      user
        .save()
        .then(() => {
          response.status = true;
          response.mobile = Mobile;
          response.email = email;
          resolve(response);
          //res.render("user/confirm");
        })
        .catch((e) => {
          console.log(e);
          response.errors = e;
          resolve(response);
        });
      //console.log(req.body);
    });
  },
  
  addAddress:async(req,res,next)=>{
    url = req.originalUrl;
    try{
   const addressfound = await Address.findOne({User:req.session.user._id})
   if(!addressfound)
   {   const address = new Address({
        User:req.session.user._id,
        Addresses: req.body
      }).save().then((doc)=>{
        // console.log(doc);
      })
    }
    else{
      const address = await Address.findOneAndUpdate({User:req.session.user._id},{$push:{Addresses:req.body}})
    }
    res.redirect('back')
  }catch(e){
    next(new AppError("Error While Adding Address",500))
  }
},
viewProfile:(req,res,next)=>{

  res.render("user/myaccount",{user:req.session.user})
},
viewAddresses:async(req,res,next)=>{
 let userAddress = await Address.findOne({User:req.session.user._id})
  res.render("user/addresses",{Address:Address.Addresses})
}


};
