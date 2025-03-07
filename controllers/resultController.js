const TestResult = require("../models/TestResult");
const { generateAnalysis } = require("../services/analysisService");

const getUserResults = async (req, res) => {
  try {
    const results = await TestResult.find({ userId: req.user.id }).populate(
      "testId"
    );
    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching results", error: error.message });
  }
};

const getResult = async (req, res) => {
  try {
    const result = await TestResult.findById(req.params.id).populate({
      path: "testId",
      populate: { path: "questions" },
    });
    if (!result || result.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Result not found or unauthorized" });
    }
    res.json(result);
  } catch (error) {
    console.error("Get result error:", error.stack);
    res
      .status(500)
      .json({ message: "Error fetching result", error: error.message });
  }
};

const updateMistakeTypes = async (req, res) => {
  const { responses } = req.body;
  try {
    const result = await TestResult.findById(req.params.id);
    if (!result || result.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Result not found or unauthorized" });
    }

    responses.forEach((update) => {
      const response = result.responses.find(
        (r) => r.questionId.toString() === update.questionId
      );
      if (response && !response.isCorrect)
        response.mistakeType = update.mistakeType;
    });

    result.analysis = await generateAnalysis(
      result.testId,
      result.responses,
      result.startTime,
      result.endTime
    );
    await result.save();

    // Populate testId.questions before returning
    const populatedResult = await TestResult.findById(req.params.id).populate({
      path: "testId",
      populate: { path: "questions" },
    });
    res.json(populatedResult);
  } catch (error) {
    console.error("Update mistake types error:", error.stack);
    res
      .status(500)
      .json({ message: "Error updating mistake types", error: error.message });
  }
};

module.exports = { getUserResults, getResult, updateMistakeTypes };
