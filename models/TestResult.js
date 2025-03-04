const mongoose = require("mongoose");


const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  responses: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      userAnswer: String,
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
  analysis: {
    topicPerformance: [
      {
        topic: String,
        correct: Number,
        total: Number,
      },
    ],
    difficulty: { type: String, enum: ["easy", "hard"] }, // Based on exam
    tips: [String],
  },
});


module.exports = mongoose.model("TestResult", testResultSchema);
