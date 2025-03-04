const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const { auth, adminAuth } = require("../middleware/auth");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const storage = multer.memoryStorage();
const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

router.post(
  "/add",
  auth,
  adminAuth,
  upload.array("images"),
  async (req, res) => {
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
      const parsedOptions = JSON.parse(options);

      const imageFiles = req.files || [];
      const uploadedImages = await Promise.all(
        imageFiles.map((file) => uploadToCloudinary(file.buffer))
      );

      const newQuestion = new Question({
        questionId: `q-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        exam,
        class: classLevel,
        subject,
        topic,
        chapter,
        type,
        content, // Markdown string
        options: parsedOptions,
        correctAnswer,
        explanation: explanation || "",
        metadata: { images: uploadedImages },
      });

      await newQuestion.save();
      res.status(201).json(newQuestion);
    } catch (error) {
      res.status(500).json({ message: "Error adding question", error });
    }
  }
);

router.get("/filter", auth, async (req, res) => {
  const { class: classLevel, subject, topic, chapter, limit = 100 } = req.query;
  try {
    const query = {};
    if (classLevel) query.class = classLevel;
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (chapter) query.chapter = chapter;
    query.status = "active";

    const questions = await Question.find(query).limit(parseInt(limit));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const question = await Question.findOne({ questionId: req.params.id });
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Error fetching question", error });
  }
});

router.put(
  "/:id",
  auth,
  adminAuth,
  upload.array("images"),
  async (req, res) => {
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
      const parsedOptions = JSON.parse(options);

      const imageFiles = req.files || [];
      const uploadedImages = await Promise.all(
        imageFiles.map((file) => uploadToCloudinary(file.buffer))
      );

      const updatedQuestion = await Question.findOneAndUpdate(
        { questionId: req.params.id },
        {
          exam,
          class: classLevel,
          subject,
          topic,
          chapter,
          type,
          content, // Markdown string
          options: parsedOptions,
          correctAnswer,
          explanation: explanation || "",
          "metadata.updatedAt": Date.now(),
          ...(imageFiles.length > 0 && { "metadata.images": uploadedImages }),
        },
        { new: true }
      );

      if (!updatedQuestion)
        return res.status(404).json({ message: "Question not found" });
      res.json(updatedQuestion);
    } catch (error) {
      res.status(500).json({ message: "Error updating question", error });
    }
  }
);

module.exports = router;
