const nodemailer = require('nodemailer');
const { create } = require('../models/userModel');

//new Email(user, url);

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours Tour <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Sendgrid
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      //service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
};

const sendEmail = async (options) => {
  // Step 1=> Create a Transporter (ex.=>gmail)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    //service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },

    // Activate in gmail "less secure app" option
  });
  // Step 2=> define Options
  const mailOptions = {
    from: 'Natours <mshanit@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Step 3=> Actually send email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
