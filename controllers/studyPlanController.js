const StudyPlan = require("../models/StudyPlan");

const getStudyPlan = async (req, res) => {
  try {
    let plan = await StudyPlan.findOne({ userId: req.user.id });
    if (!plan) {
      plan = new StudyPlan({ userId: req.user.id, tasks: [] });
      await plan.save();
    }
    res.json(plan);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching study plan", error: error.message });
  }
};

const updateStudyPlan = async (req, res) => {
  const { tasks, targetScore } = req.body;
  try {
    const plan = await StudyPlan.findOneAndUpdate(
      { userId: req.user.id },
      { tasks, targetScore, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(plan);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating study plan", error: error.message });
  }
};

module.exports = { getStudyPlan, updateStudyPlan };
