const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  exam: { type: String, enum: ["jee-mains", "jee-advanced"], required: true },
  class: { type: String, enum: ["11", "12"], required: true },
  subject: { type: String, enum: ["physics", "chemistry", "mathematics"] },
  topic: { type: String },
  chapter: { type: String },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    marks: { type: Number, default: 0 },
    timeAllotted: { type: Number, default: 0 }, // in milliseconds
  },
  status: { type: String, enum: ["active", "draft"], default: "active" },
});

module.exports = mongoose.model("Test", testSchema);
