const Cart = require("../models/cart");
const AppError = require("../utils/apperr");
const UserModel = require("../models/user");
const Products = require("../models/products");
const wishlist = require("../models/wishlilst");
const { default: mongoose } = require("mongoose");


module.exports = {
  addtocart: async (req, res, next) => {
    let product = req.body.productid;
    let cust = req.session.user;
    let Qnty = req.body.productqnty;
    console.log(Qnty);
    let response = {};
    let User = cust._id;
    let Products = [];
    Item = {
      Items: product,
      Qty: Qnty,
    };
    try {
      if (!cust.Cart) {
        Products.push(Item);

        const cart = new Cart({
          User,
          Products,
        });
        console.log(cart);
        cart.save().then(async(data) => {
          console.log(data);
          let cartid = data._id;  
          let CartCount = await module.exports.getCartCount(req.session.user._id);
          req.session.CartCount = CartCount
         await UserModel.findOneAndUpdate({ _id: User }, { Cart: cartid })
            res.redirect("/cart")
          
        });
      } else {
        let UserCart = await Cart.findById(cust.Cart);
        let exist = UserCart.Products.filter((value) => value.Items == product);

        console.log(product, cust.Cart);
        // let exist = allproducts.includes(`new ObjectId("${product}")`);
        console.log(exist.length);

        //update qty of existing product
        async function UpdateQuantity(product, cust) {
          await Cart.findOneAndUpdate(
            {
              _id: cust.Cart,
              "Products.Items": product,
            },
            {
              $inc: {
                "Products.$.Qty": Qnty,
              },
            }
          ).then((doc) => {
            response.status = true;
            console.log("djsknh");
          });
        }
        if (exist.length !== 0) {
          UpdateQuantity(product, cust);
          res.redirect("/cart");
        }
      
        else if (UserCart.Products == "null") {
          response.null = true;
          res.redirect("/cart");
        }
          //adding a new product
        else {
          console.log("dkkkl,", Item, cust.Cart);

          await Cart.findOneAndUpdate(
            { _id: cust.Cart },
            { $push: { Products: Item } }
          ).then((doc) => {
            console.log("dk");
            res.redirect("/cart");
          });
        req.session.CartCount = req.session.CartCount +1;
        }
        cartController.addtocart(product, cust).then((response) => {
          res.redirect("/cart");
        });
      }
    } catch (e) {
      next(new AppError("error while adding to cart!!", 404));
    }
  },
  findcart: (req, res, next) => {
    user = req.session.user;
    let cartnull = false;
    let products;
    let totalprice = 0;
    id = user.Cart;
     
    try {
      Cart.findById(id)
        .populate("Products.Items")
        .then((data) => {
          if(!data || data.Products.length == 0)
          {
            cartnull = true;
          }
     else {  
        products = data.Products 
          for (let item of products) {
            totalprice += item.Qty * item.Items.SellingPrice;
          }
         }
          res.render("user/cart", {
            Products: products,
            Nostock: req.session.NoStock,
            cartnull,
            totalprice,
            userlogged: req.session.login,
            CartCount:req.session.CartCount
          });
        });
    } catch {
      next(new AppError("Can't fetch the Cart", 500));
    }

    // console.log(user);
  },
  removefromcart: async (req, res,next) => {
    let productid = req.params.id;
    let user = req.session.user;
    try {
      let cart = user.Cart;
      await Cart.findOneAndUpdate( 
        { _id: cart },
        { $pull: { Products: { Items: productid } } }
      );
      req.session.CartCount = req.session.CartCount -1;
     
      res.redirect("/cart");
      module.exports.getCartCount(req.session.user?._id)
      // let index = Products.indexof(product);
    } catch (error) {
      next(new AppError("errorremoving this item!!", 404));
    }
  },
  changeQty: async (req, res,next) => {
    console.log(req.body);
    try {
    let Cartid = req.session.cartid;
    let Prodid = req.body.Product;
    console.log(Prodid);
    let Qty = parseInt(req.body.Qty);
    console.log(Qty);
     if(Qty == -1 && req.body.val == 1 ){
      await Cart.findOneAndUpdate(
        { _id: Cartid },
        { $pull: { Products: { Items: Prodid } } }

      );
      req.session.CartCount = req.session.CartCount -1;
     }
    await Cart.findOneAndUpdate(
      {
        _id: Cartid,
        "Products.Items": Prodid,
      },
      {
        $inc: {
          "Products.$.Qty": Qty,
        },
      }
    ) 
    } catch{next(new AppError('Error while changing Qty'))}
      res.json("Success");
      
  },
  getwishlist: (req, res, next) => {
    wishlist
      .findOne({ User: req.session.user._id })
      .populate("Products")
      .then((data) => {
        console.log(data);
        res.render("user/wishlist", { data: data.Products,
          userlogged: req.session.login,
          CartCount:req.session.CartCount,});
      });
  },
  addtowishlist: async (req, res, next) => {
let response={
  status:false,
  message:"user not logged !"
}
    item = req.body.Product;
    let Products = [];
    try {
      
   
    let userid = req.session.user._id;
    let exist = await wishlist.findOne({ User: userid });
    if (!exist) {
      Products.push(item);
      let newWishlist = new wishlist({
        User: userid,
        Products: Products,
      });

      newWishlist.save((data) => {
            response.status= true;
            response.message = "Item Added to Wishlist"
        res.json(response);
      });
    } else {
      // console.log(exist);
      let existingitem = exist.Products.filter((value) => value == item);
      if (existingitem.length !== 0) {
       
      let respo =  await removefromwish(userid,item)
      response.status = true;
        response.message = "Item removed from Wishlist"
      res.json(response)
      } else {
        await wishlist.findOneAndUpdate(
          { User: userid },
          { $push: { Products: item } }
          
        );
       
        response.status= true;
        response.message = "Item Added to Wishlist"
        res.json(response);
        
      }
    }
  } catch (error) {
    res.json("user not logeed in")
      next(new AppError('Error found whle wishlisting!',500))
  }
  },
  
  Removefromwishlist :(req,res,next)=>{
   removefromwish(req.session.user._id,req.body.Product)
  },
  getCartCount:async(userid)=>{
 let count =await   Cart.aggregate([
    {
   $match:{
    User: mongoose.Types.ObjectId(userid)
   }
    } ,
    
    {
         $project: {
            numberofItems: { $cond: { if: { $isArray: "$Products" }, then: { $size: "$Products" }, else: 0 } }
         }
      }
      
   ] )
   console.log(count);
 
   return count[0].numberofItems
   
  },



};
let response ; 
try{
 function removefromwish(user,item){ 
 
wishlist.findOneAndUpdate(
{ User: user},
  { $pull: { Products:item } }
).then(()=>{
console.log("itempulled");
response= "removed";
    return response 
})
}}
catch(e){
  console.log(e);
  return new AppError("Error found ")
}
