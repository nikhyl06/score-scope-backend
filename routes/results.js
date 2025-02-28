const express = require("express");
const router = express.Router();
const TestResult = require("../models/TestResult");
const Test = require("../models/Test");
const { auth } = require("../middleware/auth");

// Submit Test Result
router.post("/submit", auth, async (req, res) => {
  const { testId, answers, startTime, endTime } = req.body;
  try {
    const test = await Test.findById(testId).populate("questions");
    if (!test) return res.status(404).json({ message: "Test not found" });

    let score = 0;
    const totalMarks = test.questions.length * 4; // Assuming 4 marks per question
    const resultAnswers = answers.map((answer) => {
      const question = test.questions.find(
        (q) => q._id.toString() === answer.questionId
      );
      const isCorrect = question.correctAnswer === answer.userAnswer;
      if (isCorrect) score += 4;
      else if (answer.userAnswer) score -= 1; // Negative marking
      return { ...answer, isCorrect };
    });

    const result = new TestResult({
      userId: req.user.id,
      testId,
      answers: resultAnswers,
      score,
      totalMarks,
      startTime,
      endTime,
    });
    await result.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { testsTaken: result._id },
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error submitting result", error });
  }
});

// routes/results.js
router.get("/user", auth, async (req, res) => {
  try {
    const results = await TestResult.find({ userId: req.user.id })
      .populate("testId"); // Ensure testId is populated
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Error fetching results", error });
  }
});

// Get Result by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const result = await TestResult.findById(req.params.id).populate(
      "testId questions"
    );
    if (!result || result.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Result not found or unauthorized" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching result", error });
  }
});

module.exports = router;
