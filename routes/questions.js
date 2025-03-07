const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const {
  addQuestion,
  filterQuestions,
  getQuestion,
  updateQuestion,
} = require("../controllers/questionController");

router.post("/add", auth, adminAuth, addQuestion);
router.get("/filter", auth, filterQuestions);
router.get("/:id", auth, getQuestion);
router.put("/:id", auth, adminAuth, updateQuestion);

module.exports = router;
