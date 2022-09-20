const userModel = require("../models/user");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
//const { checkout } = require("/routes/admin");

let config = {
  serviceid: process.env.TwillioMsgId,
  accountSID: process.env.TwillioSid,
  authToken: process.env.TwillioAuthToken,
};

// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TwillioSid;
const authToken = process.env.TwillioAuthToken;
const client = require("twilio")(accountSid, authToken);

module.exports = {
  getOtp: (number) => {
    try {
      return new Promise(async (resolve, reject) => {
        // let user = await userModel.findOne({ phonenumber: number });
        let response = {};
        console.log(process.env.TwillioMsgId);
        console.log(client);
        // let phonenumber = "+91" + number;
        // console.log(phonenumber);
        // if (user) {
        // response.exist = true;
        // if (!user.ActiveStatus) {
        client.verify.v2
          .services(process.env.TwillioMsgId)
          .verifications.create({ to: "+91" + number, channel: "sms" })
          .then((verification) => {
            console.log(verification.status);
            console.log(client);
            resolve(response);
          })
          .catch((e) => {
            console.log(e);
          });
      });
    } catch (error) {
      next(error);
    }
  },

  checkOtp: (otp, number) => {
    let phonenumber = "+91" + number;
    return new Promise((resolve, reject) => {
      console.log(phonenumber);
      client.verify.v2
        .services(process.env.TwillioMsgId)
        .verificationChecks.create({
          to: phonenumber,
          code: otp,
        })
        .then((verification_check) => {
          console.log(verification_check.status);
          console.log("verification success");

          resolve(verification_check.status);
        })
        .catch((err) => {
          console.log("error", err);
        });
    });
  },
};
