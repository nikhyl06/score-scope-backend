const Question = require("../models/Question");

const addQuestion = async (req, res) => {
  try {
    const {
      exam,
      class: classLevel,
      subject,
      topic,
      chapter,
      type,
      content,
      options,
      correctAnswer,
      explanation,
    } = req.body;

    const parsedOptions = JSON.parse(options || "[]");

    const newQuestion = new Question({
      questionId: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exam,
      class: classLevel,
      subject,
      topic,
      chapter,
      type,
      content,
      options: type === "MCQ" ? parsedOptions : [],
      correctAnswer,
      explanation: explanation || "",
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding question", error: error.message });
  }
};

const updateQuestion = async (req, res) => {

  try {
    const {
      exam,
      class: classLevel,
      subject,
      topic,
      chapter,
      type,
      content,
      options,
      correctAnswer,
      explanation,
    } = req.body;

    const parsedOptions = JSON.parse(options || "[]");

    const question = await Question.findOne({ questionId: req.params.id });
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    question.exam = exam || question.exam;
    question.class = classLevel || question.class;
    question.subject = subject || question.subject;
    question.topic = topic || question.topic;
    question.chapter = chapter || question.chapter;
    question.type = type || question.type;
    question.content = content || question.content;
    question.options = type === "MCQ" ? parsedOptions : [];
    question.correctAnswer = correctAnswer || question.correctAnswer;
    question.explanation = explanation || question.explanation;
    question.metadata.updatedAt = Date.now();

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error) {
    console.error("Update error:", error);
    res
      .status(500)
      .json({ message: "Error updating question", error: error.message });
  }
};

const filterQuestions = async (req, res) => {
  const { class: classLevel, subject, topic, chapter, limit = 100 } = req.query;
  try {
    const query = { status: "active" };
    if (classLevel) query.class = classLevel;
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (chapter) query.chapter = chapter;

    const questions = await Question.find(query).limit(parseInt(limit));
    res.json(questions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};

const getQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({ questionId: req.params.id });
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching question", error: error.message });
  }
};

module.exports = { addQuestion, filterQuestions, getQuestion, updateQuestion };
