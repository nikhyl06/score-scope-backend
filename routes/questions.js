const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const { auth, adminAuth } = require("../middleware/auth");
const multer = require("multer");
const { uploadToCloudinary } = require("../utils/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add Question (Admin Only)
router.post(
  "/add",
  auth,
  adminAuth,
  upload.array("images"),
  async (req, res) => {
    try {
      const {
        category,
        subcategory,
        difficulty,
        type,
        content,
        options,
        correctAnswer,
        explanation,
      } = req.body;
      const parsedContent = JSON.parse(content);
      const parsedOptions = options ? JSON.parse(options) : [];
      const parsedExplanation = explanation
        ? JSON.parse(explanation)
        : { content: [] };

      const imageFiles = req.files || [];
      const uploadedImages = await Promise.all(
        imageFiles.map((file) => uploadToCloudinary(file.buffer))
      );

      let imageIndex = 0;
      const finalContent = parsedContent.map((block) => {
        if (block.type === "image") {
          return {
            ...block,
            url: uploadedImages[imageIndex++],
            metadata: {
              size: imageFiles[imageIndex - 1]?.size,
              format: imageFiles[imageIndex - 1]?.mimetype,
            },
          };
        }
        return block;
      });

      const newQuestion = new Question({
        category,
        subcategory,
        difficulty,
        type,
        content: finalContent,
        options: parsedOptions,
        correctAnswer,
        explanation: parsedExplanation,
        metadata: { tags: [subcategory.toLowerCase()], source: "Admin" },
      });

      await newQuestion.save();
      res.status(201).json(newQuestion);
    } catch (error) {
      res.status(500).json({ message: "Error adding question", error });
    }
  }
);

// Get Questions by Category
router.get("/:category", auth, async (req, res) => {
  try {
    const questions = await Question.find({
      category: req.params.category,
      status: "active",
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error });
  }
});

module.exports = router;
