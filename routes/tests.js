const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
const Question = require("../models/Question");
const { auth, adminAuth } = require("../middleware/auth");

// Create Test (Admin Only)
router.post("/create", auth, adminAuth, async (req, res) => {
  const { name, category, duration, questionIds, difficulty } = req.body;
  try {
    const questions = await Question.find({ _id: { $in: questionIds } });
    if (questions.length !== questionIds.length) {
      return res.status(400).json({ message: "Some questions not found" });
    }

    const newTest = new Test({
      name,
      category,
      duration,
      questions: questionIds,
      difficulty,
    });
    await newTest.save();
    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ message: "Error creating test", error });
  }
});

// Get All Tests
router.get("/", auth, async (req, res) => {
  try {
    const tests = await Test.find({ status: "active" }).populate("questions");
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tests", error });
  }
});

// Get Test by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate("questions");
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: "Error fetching test", error });
  }
});

module.exports = router;
