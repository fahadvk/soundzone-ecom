const mongoose = require('mongoose')
const BannerSchema = new mongoose.Schema({
    Image:{
      type:String,
    },
    Heading:{
      type:String
    },
    SubHeading:{
      type:String
    },
    Description:{
      type:String
    },
  
  },{timestamps:true})
  const Banner = mongoose.model("Banner",BannerSchema)
  module.exports = Banner;