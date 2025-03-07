const Test = require("../models/Test");
const Question = require("../models/Question");
const TestResult = require("../models/TestResult");
const User = require("../models/User");
const { generateAnalysis } = require("../services/analysisService");

const createTest = async (req, res) => {
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
    console.error("Create test error:", error);
    res
      .status(500)
      .json({ message: "Error creating test", error: error.message });
  }
};

const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find({ status: "active" }).populate("questions");
    res.json(tests);
  } catch (error) {
    console.error("Get all tests error:", error);
    res
      .status(500)
      .json({ message: "Error fetching tests", error: error.message });
  }
};

const getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate("questions");
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json(test);
  } catch (error) {
    console.error("Get test error:", error);
    res
      .status(500)
      .json({ message: "Error fetching test", error: error.message });
  }
};

const submitTest = async (req, res) => {
  const { responses, startTime, endTime } = req.body;
  const testId = req.params.testId;

//   console.log(req.body, testId);

  if (!responses || !Array.isArray(responses) || !startTime || !endTime) {
    return res
      .status(400)
      .json({
        message: "Missing required fields: responses, startTime, or endTime",
      });
  }

  try {
    // Fetch test and validate
    const test = await Test.findById(testId).populate("questions");
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Validate all questionIds exist in test
    const testQuestionIds = new Set(
      test.questions.map((q) => q._id.toString())
    );
    const invalidQuestionIds = responses.filter(
      (r) => !testQuestionIds.has(r.questionId)
    );
    if (invalidQuestionIds.length > 0) {
      return res.status(400).json({
        message: "Some questionIds do not belong to this test",
        invalidIds: invalidQuestionIds.map((r) => r.questionId),
      });
    }

    // Calculate score and prepare responses
    let score = 0;
    const totalMarks = test.questions.reduce(
      (sum, q) => sum + (q.metadata.marks || 4),
      0
    );
    const resultResponses = responses.map((response) => {
      const question = test.questions.find(
        (q) => q._id.toString() === response.questionId
      );
      const isCorrect =
        String(question.correctAnswer) === String(response.userAnswer);
      if (isCorrect) score += question.metadata.marks || 4;
      else if (response.userAnswer) score -= question.metadata.negMarks || 1;
      return {
        questionId: response.questionId,
        userAnswer: response.userAnswer,
        timeSpent: response.timeSpent,
        isCorrect,
      };
    });

    // Generate analysis
    const analysis = await generateAnalysis(
      testId,
      resultResponses,
      startTime,
      endTime
    );

    // Save test result
    const result = new TestResult({
      userId: req.user.id,
      testId,
      responses: resultResponses,
      score,
      totalMarks,
      startTime,
      endTime,
      analysis,
    });
    await result.save();

    // Update user's test history
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { testsTaken: result._id } },
      { new: true }
    );

    res.status(201).json(result);
  } catch (error) {
    console.error("Submit test error:", error.stack); // Detailed logging
    res
      .status(500)
      .json({ message: "Error submitting test", error: error.message });
  }
};

module.exports = { createTest, getAllTests, getTest, submitTest };
