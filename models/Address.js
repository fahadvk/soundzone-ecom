const mongoose = require("mongoose")
const AddressSchema = new mongoose.Schema(
    {
        User:{
            type:mongoose.Types.ObjectId,
            required : true
        },  
    
   Addresses: [{
    FirstName:{
        type:String,
        required:true
    },
    LastName:{
        type:String,
    },
    Phone:{
        type:Number,
        required:true
    },
    Email:{
        type:String,

    },
    House:{
type:String
    },
    Address:{
        type:String,
    },
    Pincode:{
        type:Number
    },
    City:{
        type:String
    },
    State:{
        type:String
    }
}]
})
const Address = mongoose.model("Address",AddressSchema);
module.exports = Address;
