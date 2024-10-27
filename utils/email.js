const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `KootShop noreply@koot.shop`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(text, subject) {
    // define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: text + ` URL : ${this.url}`,
    };

    //3) create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendPasswordReset() {
    await this.send(
      "Password Reset",
      "Your password reset token (valid for 10 minutes)"
    );
  }
};
