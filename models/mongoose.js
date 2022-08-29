const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://mongo:mern123@cluster0.fwrdx.mongodb.net/AudioZone?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);
module.exports = mongoose;
