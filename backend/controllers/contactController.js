const nodemailer = require('nodemailer');
const Joi = require('joi');
const dotenv = require('dotenv');

dotenv.config();

exports.sendContactMessage = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    message: Joi.string().min(5).max(2000).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { name, email, message } = req.body;

  try {
    // Configure nodemailer (using Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_EMAIL_USER,
        pass: process.env.CONTACT_EMAIL_PASS, // Set this in your .env file
      },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.CONTACT_EMAIL_USER,
      subject: `【RunMapお問い合わせ】${name}さんより`,
      text: `お名前: ${name}\nメール: ${email}\n\n${message}`,
    });

    res.json({ message: 'お問い合わせが送信されました。' });
  } catch (err) {
    res.status(500).json({ message: 'メール送信に失敗しました', error: err.message });
  }
}; 