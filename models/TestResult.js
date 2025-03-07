const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  responses: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      userAnswer: String,
      isCorrect: Boolean,
      timeSpent: Number, // in seconds
      mistakeType: {
        type: String,
        enum: ["conceptual", "silly", "not_studied", null],
        default: null,
      },
    },
  ],
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["completed", "in-progress"],
    default: "completed",
  },
  analysis: {
    topicPerformance: [
      {
        topic: { type: String, required: true },
        correct: { type: Number, required: true },
        total: { type: Number, required: true },
        accuracy: { type: Number, required: true },
      },
    ],
    questionTypePerformance: [
      {
        type: { type: String, required: true },
        correct: { type: Number, required: true },
        total: { type: Number, required: true },
        accuracy: { type: Number, required: true },
      },
    ],
    timeManagement: {
      totalTime: { type: Number, required: true },
      averageTimePerQuestion: { type: Number, required: true },
      questionsExceededTime: [{ questionId: String, timeSpent: Number }],
    },
    mistakeDistribution: {
      conceptual: { type: Number, default: 0 },
      silly: { type: Number, default: 0 },
      not_studied: { type: Number, default: 0 },
    },
    difficulty: { type: String, enum: ["easy", "hard"], required: true },
    tips: [{ type: String }],
  },
});

module.exports = mongoose.model("TestResult", testResultSchema);
