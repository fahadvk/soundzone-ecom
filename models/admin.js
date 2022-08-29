const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = mongoose.model("Admin", {
  username: {
    type: String,
  },
  Password: {
    type: String,
  },
});

// const me = new Admin({
//   username: "fahad",
//   Password: "$2b$10$Cxu91htfT1N0dAGOPeojXeWUl/987LIr1VtZlCP08U9O2skBCjUH6",
// });
// me.save().then({}).catch({});
module.exports = Admin;
