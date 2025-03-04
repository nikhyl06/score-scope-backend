const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionId: { type: String, unique: true, required: true },
  exam: { type: String, required: true },
  class: { type: String, enum: ["11", "12"], required: true },
  subject: {
    type: String,
    enum: ["physics", "chemistry", "mathematics"],
    required: true,
  },
  topic: { type: String, required: true },
  chapter: { type: String, required: true },
  type: {
    type: String,
    enum: ["MCQ", "Numerical", "True/False"],
    required: true,
  },
  content: { type: String, required: true }, // Markdown string
  options: [
    {
      id: { type: String, required: true }, // e.g., "A"
      content: { type: String, required: true }, // Markdown string
      isCorrect: { type: Boolean, default: false },
    },
  ],
  correctAnswer: { type: String, required: true },
  explanation: { type: String }, // Markdown string, optional
  metadata: {
    paperId: { type: String },
    year: { type: Number },
    marks: { type: Number, default: 4 },
    negMarks: { type: Number, default: 1 },
    timeAllotted: { type: Number, default: 120000 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  status: {
    type: String,
    enum: ["active", "draft", "archived"],
    default: "active",
  },
});

questionSchema.index({ exam: 1, class: 1, subject: 1, topic: 1, chapter: 1 });

module.exports = mongoose.model("Question", questionSchema);
