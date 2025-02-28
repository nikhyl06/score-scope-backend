const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// Update Profile
router.put("/", auth, async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const user = await User.findById(req.user.id);
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
    res.status(500).json({ message: "Error updating profile", error });
  }
});

module.exports = router;
