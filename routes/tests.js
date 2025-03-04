const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Test = require("../models/Test");
const TestResult = require("../models/TestResult");
const Question = require("../models/Question");
const User = require("../models/User");
const { auth, adminAuth } = require("../middleware/auth");



// Create Test (Admin Only)
router.post("/create", auth, adminAuth, async (req, res) => {
  const {
    name,
    exam,
    class: classLevel,
    subject,
    topic,
    chapter,
    questionIds,
  } = req.body;
  try {
    const questions = await Question.find({ _id: { $in: questionIds } });
    if (questions.length !== questionIds.length) {
      return res.status(400).json({ message: "Some questions not found" });
    }

    const totalMarks = questions.reduce(
      (sum, q) => sum + (q.metadata.marks || 4),
      0
    );
    const totalTime = questions.reduce(
      (sum, q) => sum + (q.metadata.timeAllotted || 120000),
      0
    );

    const newTest = new Test({
      name,
      exam,
      class: classLevel,
      subject,
      topic,
      chapter,
      questions: questionIds,
      metadata: { marks: totalMarks, timeAllotted: totalTime },
    });
    await newTest.save();
    res.status(201).json(newTest);
  } catch (error) {
    console.error("Error creating test:", error.message);
    res
      .status(500)
      .json({ message: "Error creating test", error: error.message });
  }
});

// Get All Tests
router.get("/", auth, async (req, res) => {
  try {
    const tests = await Test.find({ status: "active" }).populate("questions");
    res.json(tests);
  } catch (error) {
    console.error("Error fetching tests:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching tests", error: error.message });
  }
});

// Get Test by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate("questions");
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json(test);
  } catch (error) {
    console.error("Error fetching test:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching test", error: error.message });
  }
});

// Submit Test Response (Student)
// ... (other imports and schemas remain the same)

// Submit Test Response (Student)
router.post("/submit/:testId", auth, async (req, res) => {
  const { responses, startTime, endTime } = req.body;
  try {
    const test = await Test.findById(req.params.testId).populate("questions");
    if (!test) return res.status(404).json({ message: "Test not found" });

    let score = 0;
    const totalMarks = test.questions.reduce((sum, q) => sum + (q.metadata.marks || 4), 0);
    const resultResponses = responses.map(response => {
      const question = test.questions.find(q => q._id.toString() === response.questionId);
      if (!question) throw new Error(`Question ${response.questionId} not found`);
      const isCorrect = String(question.correctAnswer) === String(response.userAnswer);
      if (isCorrect) score += question.metadata.marks || 4;
      else if (response.userAnswer) score -= question.metadata.negMarks || 1;
      return { ...response, isCorrect };
    });

    const result = new TestResult({
      userId: req.user.id,
      testId: req.params.testId,
      responses: resultResponses,
      score,
      totalMarks,
      startTime,
      endTime,
    });
    await result.save();

    await User.findByIdAndUpdate(req.user.id, { $push: { testsTaken: result._id } });
    res.status(201).json(result); // Ensure _id is included in response
  } catch (error) {
    console.error("Error submitting test:", error.message);
    res.status(500).json({ message: "Error submitting test", error: error.message });
  }
});

// Get Student Test Results
router.get("/results/user", auth, async (req, res) => {
  try {
    const results = await TestResult.find({ userId: req.user.id }).populate(
      "testId"
    );
    res.json(results);
  } catch (error) {
    console.error("Error fetching results:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching results", error: error.message });
  }
});

// Simplified Analysis Generation
function generateAnalysis(test, responses) {
  const topicPerformance = {};

  responses.forEach((response) => {
    const question = test.questions.find(
      (q) => q._id.toString() === response.questionId
    );
    if (!question) return;

    topicPerformance[question.topic] = topicPerformance[question.topic] || {
      correct: 0,
      total: 0,
    };
    topicPerformance[question.topic].total++;
    if (response.isCorrect) topicPerformance[question.topic].correct++;
  });

  const difficulty = test.exam === "jee-mains" ? "easy" : "hard";
  const tips = generateTips(topicPerformance, difficulty);

  return {
    topicPerformance: Object.entries(topicPerformance).map(
      ([topic, { correct, total }]) => ({ topic, correct, total })
    ),
    difficulty,
    tips,
  };
}

// Generate Simple Personalized Tips
function generateTips(topicPerformance, difficulty) {
  const tips = [];
  const weakTopics = Object.entries(topicPerformance)
    .filter(([_, perf]) => perf.correct / perf.total < 0.5)
    .map(([topic]) => topic);

  if (weakTopics.length > 0) {
    tips.push(
      `Practice more questions on ${weakTopics.join(
        ", "
      )} to improve your score.`
    );
  }
  if (difficulty === "hard" && weakTopics.length > 0) {
    tips.push(
      "Focus on advanced JEE problems in your weak areas to build confidence."
    );
  } else if (difficulty === "easy" && weakTopics.length > 0) {
    tips.push(
      "Review basic concepts in ${weakTopics.join(",
      ")} to strengthen your foundation."
    );
  }
  if (tips.length === 0)
    tips.push("Good work! Keep practicing to maintain your performance.");
  return tips;
}

module.exports = router;
