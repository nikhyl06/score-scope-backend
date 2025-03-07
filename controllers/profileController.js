const User = require("../models/User");

const updateProfile = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (password) user.password = password;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

const changeUserRole = async (req, res) => {
  const { role } = req.body;
  if (!["student", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }
    user.role = role;
    user.updatedAt = Date.now();
    await user.save();
    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error changing role", error: error.message });
  }
};

module.exports = { updateProfile, getAllUsers, changeUserRole };
