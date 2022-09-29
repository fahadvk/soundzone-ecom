require("mongoose");
const Admin = require("../models/admin");
const User = require("../models/user");
const Category = require("../models/category");
const bcrypt = require("bcrypt");
const { response } = require("../app");
const Coupons = require("../models/coupons");
const Order = require("../models/Order")
module.exports = {
  adminlogin: (data) => {
    return new Promise(async (resolve, reject) => {
     
      let response = {
        status: false,
      };
  
      let admin = await Admin.findOne({ username: data.email });
      if (admin) {
        let Password = admin.Password;
        console.log(Password);
     

        bcrypt.compare(data.Password, Password).then((status) => {
          if (status) {
            console.log("success");
    
            response.status = true;
            resolve(response);
      
          } else {
            console.log("no");
            resolve(response);
         
          }
        });
      } else {
        console.log("failed");
        resolve(response);
    
      }
    });
  },

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
    res.render("admin/coupons",{data,layout:"admin/adminlayout",adminlogged:true})
})
  },
  addcoupon:(req,res,next)=>{
    console.log(req.body);
  
    Coupons.create(req.body).then(async(doc)=>{
      let Data;
      if(req.body.Category == 'All Current Users'  || 'AllUser'){
        User.find({},"_id ").then(async(data)=>{ Data =  data.map((a)=>{ return a._id })
        console.log(Data);
        doc.ActiveUsers = Data;
        console.log(doc);
         await doc.save() 
      })
      }
      res.redirect("/admin/coupons")
    })
  
  },
  Deletecoupon:(req,res,next)=>{
    console.log(req.body);
    Coupons.findOneAndDelete({_id:req.body.id}).then(()=>{
    res.redirect("/admin/coupons")
    })
  },
  getSalesReport: async(req,res,next)=>
  {
    console.log("ithenth myr")
 let Daywise = await Order.aggregate(
      [
 {
          $group:
            {
              _id: { day: { $dayOfMonth: "$createdAt"} , year: { $year: "$createdAt" } , month:{$month:"$createdAt"}},
              totalAmount: { $sum: "$TotalPrice" },
              count: { $sum: 1 }
            }
        },
        {
          $sort:{
            '_id' : -1
          }
        }
        
      ]
   )
   let  Today = new Date().getDate()
   let Month =  new Date().getMonth()
   let Year = new Date().getFullYear()
  //  console.log(TotalAmounts,Today);
 let todaySale =  Daywise.filter((data)=>{
     return data._id.day == Today && data._id.year == Year && data._id.month == Month+1
  })

 Daywise = Daywise.slice(-7)

  let Monthly = await   Order.aggregate(
    [
      {
        $group:
          {
            _id: { year: { $year: "$createdAt" } , month:{$month:"$createdAt"}},
            totalAmount: { $sum: "$TotalPrice" },
            count: { $sum: 1 }
          }


      },
    
    ]
 ) 
  console.log(Daywise,Monthly)
  let response = {
    todaySale,
    Monthly,
    Daywise,
    Today,

  }
    res.json(response)
  },
 


};
