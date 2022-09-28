const  Cart =require("../models/cart")
const Address = require("../models/Address")
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const Orders = require("../models/Order")
const Razorpay = require("razorpay");
const AppError = require("../utils/apperr");
const Coupons = require("../models/coupons");
const Products = require("../models/products");
const { default: mongoose } = require("mongoose");
var instance = new Razorpay({
  key_id: process.env.Razorpaykey,
  key_secret: process.env.Razorpay_secret,
});

module.exports={
    viewcheckout:async(req,res,next)=>{
      
   let Items = []
        try {
          let Addresses = await Address.findOne({User:req.session.user._id})
          if(!Addresses)
          {
            Addresses ={}
          }
          let Total = req.body.subtotal;
         if(req.body.Product){
          let data = await Products.findOne({_id:mongoose.Types.ObjectId(req.body.Product)},"Products.Items Name SellingPrice Images")
         Items = data;
         req.session.placeorder = {
          status:true,
          Items:Items,
        }
         }
         else {
        let data = await  Cart.findById(req.session.user.Cart).populate("Products.Items","Name SellingPrice Images Quantity" )
        Items = data.Products 
     let OutofStock =   Items.map((val)=>{
          console.log(val.Qty,val.Items.Quantity);

          if(val.Qty>val.Items.Quantity)
          { let nostock;
            (val.Items.Quantity <= 0)? nostock=true:""
            let NoStockItems = {
              AvailableQty: val.Items.Quantity,
              ProductName:val.Items.Name,
              nostock,
              
            }
            return NoStockItems
          }
        //  req.session.NoStock = OutofStock;
        })
        var isFromCart = true;

         }
            res.render("user/checkout",{Products:Items,
            title:"Checkout",
            isFromCart,
         subtotal :  req.body.subtotal,
         Addresses:Addresses.Addresses, 
        userlogged:req.session.login,
      Total},
        )
          } catch (error) {
          console.log(error);
          next(new AppError("Error while viewing Checkout Page",500))
        }
    
      },
 placeorder:async(req,res,next)=>{  
  try {
        let data ;
      console.log(req.body,req.session.placeorder);
    
 if(req.session.placeorder == null || undefined)
 {
  doc= await  Cart.findOne({_id :req.session.user.Cart},'Products.Items Products.Qty')
  console.log(doc);
  data = doc.Products;
let OrderList ={
} 
  }
 else {   
  data =  req.session.placeorder.Items;
  console.log('thtu',data);
  data = {
      Items:data._id,
      Qty:1,
        }
    }   
 const Order = new Orders({User: req.session.user._id,
  Products:data,
 Paymentmethod:req.body.Payment,
 Address:req.body.Address,
 TotalPrice:req.body.Total,
 Discount:req.body.Discount,
  SubTotal:req.body.SubTotal

}) 

Order.save().then((data)=>{
  console.log(data);
  if(req.session.placeorder)
  { console.log('dks');
    req.session.placeorder = null;
    req.session.savedplaceorder = true;
  }
   Order.Products.map(async(val)=>{
   await  Products.findOneAndUpdate({_id:val.Items},{$inc:{Quantity: 0-val.Qty,Sold:val.Qty}})
   console.log(val);
   })
  let response = {}
  if(req.body.Payment === "COD"){
    // res.render("Order Confirmed");
    Orders.findOneAndUpdate({_id:data._id},{OrderStatus:"Placed"}).then((updateddata)=>{
    // res.redirect("/order-confirm/data._id")
    if(! req.session.savedplaceorder.status){
    clearCart(req.session.user._id)
    }
    else {
      req.session.savedplaceorder = null;
    }
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
      if(!req.session.savedplaceorder.status){
      clearCart(req.session.user._id)
      }
      else {
        req.session.savedplaceorder = null;
      }
  
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
viewuserOrders:async(req,res,next)=>{
  const page =parseInt(req.query.page) || 1;
  
   const items_Per_Page = 8;
  const TotalOrders =  await Orders.find({User:req.session.user._id}).countDocuments();
 Orders.find({User:req.session.user._id,OrderStatus:{$ne:'Pending'}}).sort({'createdAt':-1}).populate('Products.Items').skip((page-1)*items_Per_Page).limit(items_Per_Page).then((data)=>{ 
  res.render("user/orders",{data,
    TotalOrders,
    page,
  hasNextPage:items_Per_Page * page < TotalOrders,
  hasPreviousPage : page > 1,
  PreviousPage : page -1,
   })
})
 },
 viewsingle:async(req,res,next)=>{
  try {
  let orderDetails =   await Orders.findOne({_id:req.params.id}).populate('Products.Items')
  console.log(orderDetails);
    res.render("user/viewsingle",{orderDetails,userlogged:true,
 
  })
  }
  catch{
    next(new AppError("Error While viewing this Order ",500))
  }
},
cancelorder:async(req,res,next)=>{
 await Orders.findOneAndUpdate({_id:req.params.id},{OrderStatus:'Cancelled'})
 res.redirect("/myaccount/orders")
},
returnOrder:async(req,res,next)=>{
  await Orders.findOneAndUpdate({_id:req.params.id},{OrderStatus:'Returned'})
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
    await Orders.findOneAndUpdate({_id:req.body.id},{OrderStatus:update},{new:true}).then(async(data)=>{
       console.log(data)
      if(data.OrderStatus == 'Delivered')
      {console.log("dkdkm");
        await Orders.findOneAndUpdate({_id:req.body.id},{PaymentStatus:'Completed'})
      }
      if(data.OrderStatus == 'Return-Confirmed')
      {
        data.Products.map(async(val)=>{
          await Products.findOneAndUpdate({_id:val.Items},{$inc:{Quantity:val.Qty,Sold:0 - val.Qty}})
        })
      }
      if(data,OrderStatus == 'Refunded')
      {
        await Orders.findOneAndUpdate({_id:req.body.id},{PaymentStatus:'Refunded'})
      }
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
       req.session.CouponCode= data.CouponCode;
    await  Coupons.findOneAndUpdate({_id:data._id},{$pull:{ActiveUsers:req.session.user._id}})
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