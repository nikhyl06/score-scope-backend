const express = require("express");
const router = express.Router();
const {
  getUserResults,
  getResult,
  updateMistakeTypes,
} = require("../controllers/resultController");
const { auth } = require("../middleware/auth");

router.get("/user", auth, getUserResults);
router.get("/:id", auth, getResult);
router.put("/:id/mistakes", auth, updateMistakeTypes); // New endpoint

module.exports = router;
