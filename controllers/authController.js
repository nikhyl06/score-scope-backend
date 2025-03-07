const User = require("../models/User");
const {
  generateToken,
  sendResetPasswordEmail,
} = require("../services/authService");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ fullName, email, password });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, fullName, email, role: user.role },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    await sendResetPasswordEmail(email, token);
    res.json({ message: "Reset link sent to your email" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending reset link", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = password;
    await user.save();
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, getMe };
