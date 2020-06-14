const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Step 1=> Create a Transporter (ex.=>gmail)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    //service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
  });
  // Step 2=> define Options
  const mailOptions = {
    from: 'Natours ',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Step 3=> Actually send email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
