const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
};

const sendResetPasswordEmail = async (email, token) => {
    
  const resetLink =
    process.env.NODE_ENV === "production"
      ? `https://score-scope-frontend.vercel.app//reset-password/${token}` 
      : `http://localhost:5173/reset-password/${token}`; 
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Valid for 15 minutes.</p>`,
  });
};

module.exports = { generateToken, sendResetPasswordEmail };
