const express = require("express");
const router = express.Router();
const {
  createTest,
  getAllTests,
  getTest,
  submitTest,
} = require("../controllers/testController");
const { auth, adminAuth } = require("../middleware/auth");

router.post("/create", auth, adminAuth, createTest);
router.get("/", auth, getAllTests);
router.get("/:id", auth, getTest);
router.post("/submit/:testId", auth, submitTest);

module.exports = router;
