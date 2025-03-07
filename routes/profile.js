const express = require("express");
const router = express.Router();
const {
  updateProfile,
  getAllUsers,
  changeUserRole,
} = require("../controllers/profileController");
const { auth, adminAuth } = require("../middleware/auth");

router.put("/", auth, updateProfile);
router.get("/users", auth, adminAuth, getAllUsers);
router.put("/users/:id/role", auth, adminAuth, changeUserRole);

module.exports = router;
