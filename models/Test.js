const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // Full-Length, Subject
  duration: { type: String, required: true }, // e.g., "3 hrs"
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    tags: [String],
  },
  status: { type: String, enum: ["active", "draft"], default: "active" },
});

module.exports = mongoose.model("Test", testSchema);
