const mongoose = require("mongoose");

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tasks: [
    {
      description: { type: String, required: true },
      dueDate: { type: Date },
      completed: { type: Boolean, default: false },
      testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
    },
  ],
  targetScore: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StudyPlan", studyPlanSchema);
