const UserModel = require("../models/user");
const AppError = require("../utils/apperr");

exports.Isauth = async (req, res, next) => {
  // if (req.originalUrl != "/add-tocart" && req.originalUrl != "/add-to-wishlist")
 if(req.method !== "POST"){
  req.session.returnTo = req.originalUrl;
 }
  if (!req.session.login) {
    res.redirect("/login");
  } else {
    email = req.session.email;
    let user = await UserModel.findOne({ email: email }, { IsActive: 1 });
    if (!user.IsActive) {
      return next(new AppError("This user is blocked", 500));
    }
    // console.log(x);
    
    return next();
  }
};
exports.Adminlogged = (req,res,next)=>{
  if(!req.session.adminlogin){
    res.redirect("/admin");

  }
  else{
    return next();
  }
}