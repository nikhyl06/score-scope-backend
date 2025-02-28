const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      userAnswer: String,
      timeSpent: Number, // Seconds
      isCorrect: Boolean,
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
});

module.exports = mongoose.model("TestResult", testResultSchema);
