const nodemailer = require("nodemailer");
const { NetworkContext } = require("twilio/lib/rest/supersim/v1/network");
module.exports = {
  Sendmail: (email) => {
    try {
      const sendEmail = nodemailer.createTransport({
        host: process.env.EmailHost,
        port: process.emv.EmailPort,
        auth: {
          user: process.env.EmailUserName,
          pass: process.env.EmailPassword,
        },
      });

      var otp = Math.random();
      otp = otp * 1000000;
      otp = parseInt(otp);
      console.log(otp);
      const mailOptions = {
        to: email,
        subject: "Otp for registration is: ",
        html:
          "<h3>OTP for account verification is </h3>" +
          "<h1 style='font-weight:bold;'>" +
          otp +
          "</h1>", // html body
      };

      transporter.sendEmail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
      });
    } catch (err) {
      next(err);
    }
  },
};
