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
  content: { type: String, required: true }, // Question text (Markdown supported)
  options: {
    type: [
      {
        id: { type: String, required: true },
        content: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    // Custom validator to enforce options only for MCQ
    validate: {
      validator: function (options) {
        if (this.type === "MCQ") {
          return (
            options &&
            options.length > 0 &&
            options.every((opt) => opt.content && opt.id)
          );
        }
        // For Numerical and True/False, options should be empty or undefined
        return options.length === 0;
      },
      message: (props) =>
        props.value.length > 0
          ? "Options must have content and id for MCQ questions"
          : "Options are required for MCQ questions but not allowed for Numerical or True/False",
    },
    default: [],
  },
  correctAnswer: { type: String, required: true },
  explanation: { type: String }, // Optional explanation
  metadata: {
    paperId: { type: String },
    year: { type: Number },
    marks: { type: Number, default: 4 },
    negMarks: { type: Number, default: 1 },
    timeAllotted: { type: Number, default: 120000 }, // in milliseconds
    images: [{ type: String }], // Cloudinary URLs
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
