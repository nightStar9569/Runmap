const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_KEY
  }
});

// async function sendEmail(email, subject, body) {
//     const info = await transporter.sendMail({
//         from: process.env.EMAIL_USER, // sender address //TODO: update
//         to: email, // list of receivers
//         subject: subject, // Subject
//         text: body, // plain text body
//       //   html: "<b>Hello world?</b>", // html body
//       }).catch(console.error);

//       return info ? info.messageId : null;
// }


async function sendEmail(email, subject, body) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: body,
    });

    console.log("Email sent:", info);
    return info.messageId;
  } catch (err) {
    console.error("Error sending email:", err);
    return null;
  }
}

  module.exports = { sendEmail };