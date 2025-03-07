const express = require("express");
const router = express.Router();
const {
  getStudyPlan,
  updateStudyPlan,
} = require("../controllers/studyPlanController");
const { auth } = require("../middleware/auth");

router.get("/", auth, getStudyPlan);
router.put("/", auth, updateStudyPlan);

module.exports = router;
