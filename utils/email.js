const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) create a transporter
  //   const transporter = nodemailer.createTransport({
  //     service: "Gmail",
  //     auth: {
  //       user: process.env.EMAIL_USERNAME, // gmail account
  //       pass: process.env.EMAIL_PASSWORD, // gmail password
  //     },
  //     //Activate in gmail "less secure app" option
  //   });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //pivob85144@duscore.com mailtrap one username and password same

  // 2) define the email options
  const mailOptions = {
    from: "Jonas Sthathom <hello@jonas.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html: ,

  }

  // 3) actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;