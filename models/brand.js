const mongoose = require("mongoose");
const Categery = mongoose.model("Category", {
  Name: {
    type: String,
    required: true,
  },
});
