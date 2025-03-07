const Test = require("../models/Test");
const Question = require("../models/Question");

const generateAnalysis = async (testId, responses, startTime, endTime) => {
  const test = await Test.findById(testId).populate("questions");
  if (!test) throw new Error("Test not found");

  const totalTime = (new Date(endTime) - new Date(startTime)) / 1000;
  const questionMap = new Map(test.questions.map((q) => [q._id.toString(), q]));

  const topicPerformance = {};
  const questionTypePerformance = {};
  const questionsExceededTime = [];
  const mistakeDistribution = { conceptual: 0, silly: 0, not_studied: 0 };

  responses.forEach((response) => {
    const question = questionMap.get(response.questionId.toString());
    if (!question) return;

    // Topic Performance
    topicPerformance[question.topic] = topicPerformance[question.topic] || {
      correct: 0,
      total: 0,
    };
    topicPerformance[question.topic].total++;
    if (response.isCorrect) topicPerformance[question.topic].correct++;

    // Question Type Performance
    questionTypePerformance[question.type] = questionTypePerformance[
      question.type
    ] || { correct: 0, total: 0 };
    questionTypePerformance[question.type].total++;
    if (response.isCorrect) questionTypePerformance[question.type].correct++;

    // Time Management
    const expectedTime = (question.metadata.timeAllotted || 120000) / 1000;
    if (response.timeSpent > expectedTime) {
      questionsExceededTime.push({
        questionId: response.questionId,
        timeSpent: response.timeSpent,
      });
    }

    // Mistake Distribution
    if (!response.isCorrect && response.userAnswer && response.mistakeType) {
      mistakeDistribution[response.mistakeType]++;
    }
  });

  const topicPerformanceArray = Object.entries(topicPerformance).map(
    ([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      accuracy: total > 0 ? (correct / total) * 100 : 0,
    })
  );

  const questionTypePerformanceArray = Object.entries(
    questionTypePerformance
  ).map(([type, { correct, total }]) => ({
    type,
    correct,
    total,
    accuracy: total > 0 ? (correct / total) * 100 : 0,
  }));

  const averageTimePerQuestion =
    responses.length > 0 ? totalTime / responses.length : 0;

  // Set difficulty based on exam type
  const difficulty = test.exam === "jee-mains" ? "easy" : "hard";
  const tips = generateTips(
    topicPerformanceArray,
    questionTypePerformanceArray,
    mistakeDistribution,
    difficulty
  );

  return {
    topicPerformance: topicPerformanceArray,
    questionTypePerformance: questionTypePerformanceArray,
    timeManagement: {
      totalTime,
      averageTimePerQuestion,
      questionsExceededTime,
    },
    mistakeDistribution,
    difficulty,
    tips,
  };
};

const generateTips = (
  topicPerformance,
  questionTypePerformance,
  mistakeDistribution,
  difficulty
) => {
  const tips = [];

  const weakTopics = topicPerformance.filter((perf) => perf.accuracy < 50);
  if (weakTopics.length > 0) {
    tips.push(
      `Focus on revising ${weakTopics
        .map((t) => t.topic)
        .join(", ")} (accuracy < 50%).`
    );
  }

  const weakTypes = questionTypePerformance.filter(
    (perf) => perf.accuracy < 50
  );
  if (weakTypes.length > 0) {
    tips.push(
      `Practice more ${weakTypes.map((t) => t.type).join(", ")} questions.`
    );
  }

  if (mistakeDistribution.conceptual > 2) {
    tips.push("Review core concepts to address conceptual mistakes.");
  }
  if (mistakeDistribution.silly > 2) {
    tips.push(
      "Slow down and double-check calculations to reduce silly mistakes."
    );
  }
  if (mistakeDistribution.not_studied > 1) {
    tips.push(
      "Study unlearned topics thoroughly before attempting similar tests."
    );
  }

  // Difficulty-specific tips
  if (difficulty === "easy" && weakTopics.length > 0) {
    tips.push(
      "Strengthen your JEE Mains basics in weak areas to build a solid foundation."
    );
  } else if (difficulty === "hard" && weakTopics.length > 0) {
    tips.push(
      "Tackle advanced JEE Advanced problems in your weak areas to improve."
    );
  }

  if (tips.length === 0)
    tips.push("Great job! Keep practicing to maintain your performance.");
  return tips;
};

module.exports = { generateAnalysis };
