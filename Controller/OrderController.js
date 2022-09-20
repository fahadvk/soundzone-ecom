const  Cart =require("../models/cart")
const Address = require("../models/Address")
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const Orders = require("../models/Order")
const Razorpay = require("razorpay");
const AppError = require("../utils/apperr");
const Coupons = require("../models/coupons");
var instance = new Razorpay({
  key_id: process.env.Razorpaykey,
  key_secret: process.env.Razorpay_secret,
});

module.exports={
    viewcheckout:async(req,res,next)=>{
        // console.log(req.body);
        try {
          let Addresses = await Address.findOne({User:req.session.user._id})
          Cart.findById(req.session.user.Cart).populate("Products.Items","Name SellingPrice Images" ).then((data)=>{
         console.log();
            res.render("user/checkout",{Products:data.Products,
            title:"Checkout",
         subtotal :  req.body.subtotal,
         Addresses:Addresses.Addresses})
          })
        
        } catch (error) {
          console.log(error);
          next(new AppError("Error while viewing Checkout Page",500))
        }
    
      },
    placeorder:(req,res,next)=>{
      try {
      console.log(req.body);
      Cart.findOne({_id :req.session.user.Cart},'Products.Items Products.Qty').then(async(data)=>{
        console.log(data);
     let OrderList ={
      
     } 
 const Order = new Orders({User: req.session.user._id,
  Products:data.Products,
 Paymentmethod:req.body.Payment,
 Address:req.body.Address,
 TotalPrice:req.body.Total,
 Discount:req.body.Discount,
  SubTotal:req.body.SubTotal

}) 

Order.save().then((data)=>{
  let response = {}
  if(req.body.Payment === "COD"){
    // res.render("Order Confirmed");
    Orders.findOneAndUpdate({_id:data._id},{OrderStatus:"Placed"}).then((updateddata)=>{
    // res.redirect("/order-confirm/data._id")
    clearCart(req.session.user._id)
    response.data = updateddata;
    response.cod = true;
    console.log("opop",response.data);
    res.json(response)
    })
    
  }
  else if(req.body.Payment === "RazorPay"){
    var options = {
      amount: data.TotalPrice * 100,  // amount in the smallest currency unit
      currency: "INR",
      receipt:  ""+ data._id
    };
    instance.orders.create(options, function(err, order) {
      if(err){
        console.log(err);
      }
      console.log(order);
      res.json(order)
    });
  }

})
})
} catch (error) {
     next(new AppError("Error while Placing Order!",500))   
}

},
verifypayment:async(req,res,next)=>{
try {
  

 let  response = {
  
  status:false
 };
  console.log("kfj",req.body)
  const crypto = require("crypto")
  let hmac = crypto.createHmac('sha256',process.env.Razorpay_secret)
   hmac.update( req.body.payment.razorpay_order_id + '|' + req.body.payment.razorpay_payment_id)
  hmac= hmac.digest('hex')
  if(hmac == req.body.payment.razorpay_signature)
  { 
    Orders.findOneAndUpdate({_id:req.body.order.receipt},{PaymentStatus:"Completed",OrderStatus:"Placed"}).then((doc)=>{
   response.id = doc._id;
  //  console.log("iop",response.data);
  
      response.status = true; 
      res.json(response)
      clearCart(req.session.user._id)
  
    })
  }} catch (error) {
  next(new AppError("Error found while payment veriification!",500))
  }

},
orderconfirmation:(req,res,next)=>{
  // console.log(req.params.id)
  try {
    Order.findOne({_id:req.params.id}).populate("Products.Items").then((data)=>{
      console.log(data)
      Coupons.find({},{Name,CouponCode}).
      res.render("user/order-confirmation",{data})
      
    })
  } catch (error) {
    next(new AppError("Error while loading this page",404))
  }
   },
   getallorders:(req,res,next)=>{
    res.render("admin/orders",{  layout: "admin/adminlayout",adminlogged:true})
   }

}


function clearCart(id){
  Cart.findOne({User:id}).then((data)=>{
    data.Products = undefined;
    data.save()
  })
}