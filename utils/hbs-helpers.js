const hbs = require("hbs");
const { create } = require("hbs");

// hbs.registerHelper("inc", function (value, options) {
//     return parseInt(value) + 1;
//   });
  
//   hbs.registerHelper("eq",(x,y)=>{return x === y});
//   hbs.registerHelper("date",function(val){
//    val = val.toUTCString().slice(0, 16);
//     return val;
//   })
 exports.mult = hbs.registerHelper("mult",function (value1,value2) {
    return value1 * value2;  
  })

