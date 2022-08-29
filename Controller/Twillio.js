const userModel = require("../models/user");
//const { checkout } = require("/routes/admin");

let config = {
  serviceid: "MG39f505d8d888e880cd5eedaf28b02fc0",
  accountSID: "AC9febb1e815ba1cfd0066e711b51e4671",
  authToken: "d1e7e296a9b12c82789153b36058ee50",
};

const client = require("twilio")(config.accountSID, config.authToken);

module.exports = {
  getOtp: (number) => {
    return new Promise(async (resolve, reject) => {
      // let user = await userModel.findOne({ phonenumber: number });
      let response = {};
      let phonenumber = "+91" + number;
      console.log(phonenumber);
      // if (user) {
      // response.exist = true;
      // if (!user.ActiveStatus) {
      client.verify.v2
        .services(config.serviceid)
        .verifications.create({
          to: phonenumber,
          channel: "sms",
        })
        .then((data) => {
          console.log("response");
          response.data = data;
          //response.user = user;
          //(response.email = user.email = user.email),
          // (response.ActiveStatus = true);
          resolve(response);
        })
        .catch((err) => {
          console.log("ERROR FOUND AT VERIFICATIION"), reject(err);
        });
      //}
      // else {
      //   response.userBlocker = true;
      //   resolve(response);
      // }
      // } else {
      //   (response.exist = false), resolve(response);
      // }
    });
  },

  checkOtp: (otp, number) => {
    let phonenumber = "+91" + number;
    return new Promise((resolve, reject) => {
      client.verify.v2
        .services(config.serviceid)
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
