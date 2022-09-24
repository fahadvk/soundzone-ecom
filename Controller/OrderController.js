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
          if(!Addresses)
          {
            Addresses ={}
          }
          
          let Total = req.body.subtotal - req.session.discount;
          if(isNaN(Total)){
            Total = req.body.subtotal
          }
     console.log(Total,req.session.discount);
            res.render("user/checkout",{Products:data.Products,
            title:"Checkout",
         subtotal :  req.body.subtotal,
         Addresses:Addresses.Addresses,
        Discount:req.session.discount,
        userlogged:req.session.login,
      Total},
        )
          }).catch((err)=>{
            console.log(err);
            next(new AppError("Error while viewing Checkout Page",500))
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
    Orders.findOne({_id:req.params.id}).populate("Products.Items").then((data)=>{
      console.log(data)
      if(!data){
        next(new AppError("can't get any orders",500))
      }
      // Coupons.find({},{Name,CouponCode}).
      res.render("user/order-confirmation",{data})
      
    }).catch((e)=>{
      next(new AppError("Error while loading this page",404))
    })
  } catch (error) {
    next(new AppError("Error while loading this page",404))
  }
   },
   getallorders:(req,res,next)=>{
    Orders.find({}).sort({'createdAt':-1}).populate('Products.Items').populate('User').then((data)=>{
      // console.log(data);
    res.render("admin/orders",{  layout: "admin/adminlayout",data,adminlogged:true})
    }) 
  }
,
viewuserOrders:(req,res,next)=>{
 Orders.find({User:req.session.user._id,OrderStatus:{$ne:'Pending'}}).sort({'createdAt':-1}).populate('Products.Items').then((data)=>{
//  console.log(data);
  res.render("user/orders",{data})
})
 },
 viewsingle:async(req,res,next)=>{
  try {
  let orderDetails =   await Orders.findOne({_id:req.params.id}).populate('Products.Items')
  console.log(orderDetails);
    res.render("user/viewsingle",{orderDetails,userlogged:true})
  }
  catch{
    next(new AppError("Error While viewing this Order ",500))
  }
},
cancelorder:async(req,res,next)=>{
 await Orders.findOneAndUpdate({_id:req.params.id},{OrderStatus:'Cancelled'})
 res.redirect("/myaccount/orders")
},
updateStatus:async(req,res,next)=>{
  console.log(req.body);
  try {
    let OrderStatus =await Orders.findOne({_id:req.body.id},"OrderStatus")
  let Statsuses =  Orders.schema.path('OrderStatus').enumValues;
  let val = OrderStatus.OrderStatus;
  let index = Statsuses.indexOf(val);
   if(index < 7){
  let update = Statsuses[index+1]
  console.log(index);
    Orders.findOneAndUpdate({_id:req.body.id},{OrderStatus:update}).then((data)=>{
      console.log(data);
      res.json(data)
    })
 }
} catch (error) {
    next(new AppError("Error while updating order",500))
}
},
verifycoupon:(req,res,next)=>{
  let response = {};
  Coupons.findOne({
  CouponCode:req.body.check
  }).then(async(data)=>{
    if(!data){
      response.message = "Invalid Coupon"
      res.json(response)
    }
    else{
      if(!data.ActiveUsers.includes(req.session.user._id))
      { response.message = "Sorry this Coupon is not Available"
        res.json(response);
      }
  console.log(data);
  if(req.body.Subtotal >= data.Minamount)
  {
    let Discount =req.body.Subtotal * data.Discount/100;
    console.log(Discount);
    Discount > data.MaxDiscount ? Discount = data.MaxDiscount:"";
    response.message = `${data.Name}Coupon applied`
  // await Cart.findOneAndUpdate({User:req.session.user._id},{Discount:Discount})
      response.status = true;
      response.Discount = Discount;


    res.json(response)

  }
  else{
    response.message = `Minimum ${data.Minamount} is requried for this coupon`
    res.json(response)
  }
}
  })
}

}


function clearCart(id){
  Cart.findOne({User:id}).then((data)=>{
    data.Products = undefined;
    data.save()
  })
}