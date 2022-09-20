const dotenv = require("dotenv");
const { create } = require("hbs");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const { NetworkContext } = require("twilio/lib/rest/supersim/v1/network");
const db = process.env.DATABASE;
try {
  mongoose
    .connect(
      db,
      { useNewUrlParser: true }
    )
    .catch((e) => {
      console.log(e);
    });
} catch (error) {
  next(error);
}

module.exports = mongoose;
