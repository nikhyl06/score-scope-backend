const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  type: {
    type: String,
    enum: ["MCQ", "Numerical", "True/False"],
    required: true,
  },
  content: [
    {
      type: {
        type: String,
        enum: ["text", "image", "equation", "table"],
        required: true,
      },
      value: String,
      url: String,
      description: String,
      data: [[String]],
      metadata: Object,
    },
  ],
  options: [{ id: String, text: String, isCorrect: Boolean }],
  correctAnswer: String,
  explanation: {
    content: [
      {
        type: { type: String, enum: ["text", "equation"], required: true },
        value: String,
      },
    ],
  },
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    tags: [String],
    weightage: { type: Number, default: 4 },
    source: String,
  },
  status: {
    type: String,
    enum: ["active", "draft", "archived"],
    default: "draft",
  },
});

module.exports = mongoose.model("Question", questionSchema);
