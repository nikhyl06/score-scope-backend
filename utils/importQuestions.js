const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Question = require("../models/Question"); // Adjust path to your model file

const finalExam = "jee-main"
const finalSubject = "physics"
const finalChapter = "electrostatics";
const finalClass = "11"
const finalTopic = "electricity";

dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Custom HTML to Markdown parser with extra line spacing
const htmlToMarkdown = (html) => {
  let markdown = html;

  // Replace Unicode-encoded HTML tags
  markdown = markdown.replace(/\\u003C/g, "<").replace(/\\u003E/g, ">");

  // Replace <p> tags with newlines, adding extra spacing after </p>
  markdown = markdown.replace(/<p>/g, "").replace(/<\/p>/g, "\n\n\n");

  // Replace <br> with a single newline
  markdown = markdown.replace(/<br>/g, "\n");

  // Handle images with the fixed URL, adding an extra newline
  markdown = markdown.replace(
    /<img\s+src="[^"]*"\s*[^>]*alt="([^"]*)"\s*[^>]*>/g,
    (match, alt) =>
      `![${"Image"
      }](https://static.vecteezy.com/system/resources/thumbnails/008/695/917/small_2x/no-image-available-icon-simple-two-colors-template-for-no-image-or-picture-coming-soon-and-placeholder-illustration-isolated-on-white-background-vector.jpg)\n`
  );

  // Handle tables with extra spacing
  if (markdown.includes("<table")) {
    let tableMarkdown = "";
    const tableMatch = markdown.match(/<table[^>]*>([\s\S]*?)<\/table>/);
    if (tableMatch) {
      const tableContent = tableMatch[1];

      // Extract thead and tbody
      const theadMatch = tableContent.match(/<thead>([\s\S]*?)<\/thead>/);
      const tbodyMatch = tableContent.match(/<tbody>([\s\S]*?)<\/tbody>/);

      let headers = [];
      let rows = [];

      // Parse headers from thead
      if (theadMatch) {
        const headRows = theadMatch[1].match(/<tr>([\s\S]*?)<\/tr>/g) || [];
        headRows.forEach((row) => {
          const cells = row.match(/<th[^>]*>([\s\S]*?)<\/th>/g) || [];
          headers = cells.map((cell) =>
            cell.replace(/<th[^>]*>([\s\S]*?)<\/th>/, "$1").trim()
          );
        });
      }

      // Parse rows from tbody
      if (tbodyMatch) {
        const bodyRows = tbodyMatch[1].match(/<tr>([\s\S]*?)<\/tr>/g) || [];
        rows = bodyRows.map((row) => {
          const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
          return cells.map((cell) =>
            cell.replace(/<td[^>]*>([\s\S]*?)<\/td>/, "$1").trim()
          );
        });
      }

      // Build Markdown table with extra spacing
      if (headers.length > 0) {
        tableMarkdown += "\n\n"; // Extra spacing before table
        tableMarkdown += "| " + headers.join(" | ") + " |\n";
        tableMarkdown += "| " + headers.map(() => "---").join(" | ") + " |\n";
        rows.forEach((row) => {
          tableMarkdown += "| " + row.join(" | ") + " |\n";
        });
        tableMarkdown += "\n"; // Extra spacing after table
      }

      // Replace the original table with Markdown version
      markdown = markdown.replace(
        /<table[^>]*>[\s\S]*?<\/table>/,
        tableMarkdown
      );
    }
  }

  // Remove remaining HTML tags
  markdown = markdown.replace(/<\/?[a-z][a-z0-9]*[^>]*>/gi, "");

  // Fix LaTeX: Replace double backslashes with single
  markdown = markdown.replace(/\\{2}/g, "\\");

  // Separate consecutive $$$$ into $$ $$ with extra spacing
  markdown = markdown.replace("$$$$", "$$ $$");

  markdown = markdown
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

  // Clean up extra newlines, ensuring at least two but allowing three for extra spacing
  markdown = markdown.replace(/\n{4,}/g, "\n\n\n").trim();

  return markdown;
};

// Generate unique question ID
const generateQuestionId = (exam, subject, chapter, index) => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `${exam}-${subject}-${chapter}-${index}-${timestamp}-${randomStr}`.toLowerCase();
};

// Import function
const importQuestions = async (questionCategories) => {
  await connectDB();

  let questionIndex = 0;

  // Iterate through each category
  for (const category of questionCategories) {
    const questionTypeMap = {
      integer: "Numerical",
      mcq: "MCQ",
      // Add more mappings if needed (e.g., 'truefalse': 'True/False')
    };
    const schemaType = questionTypeMap[category.key] || "MCQ"; // Default to MCQ if unknown

    for (const q of category.questions) {
      const enData = q.question.en;

      const question = new Question({
        questionId: generateQuestionId(
          finalExam,
          finalSubject,
          finalChapter,
          questionIndex++
        ),
        exam: finalExam,
        class: finalClass, // Set manually as "11" or "12" during import
        subject: finalSubject,
        topic: finalTopic,
        chapter: finalChapter,
        type: schemaType,
        content: htmlToMarkdown(enData.content),
        options: enData.options.map((opt) => ({
          id: opt.identifier,
          content: htmlToMarkdown(opt.content),
          isCorrect: enData.correct_options.includes(opt.identifier),
        })),
        correctAnswer:
          enData.correct_options.length > 0
            ? enData.correct_options[0]
            : enData.answer || "",
        explanation: enData.explanation
          ? htmlToMarkdown(enData.explanation)
          : "",
        metadata: {
          paperId: q.paperId,
          year: q.year,
          marks: q.marks || 4,
          negMarks: q.negMarks || 1,
          timeAllotted: q.timeAllotted || 120000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        status: "active",
      });

      try {
        await question.save();
        console.log("Imported question explanation:", question.id);
      } catch (error) {
        console.error(
          "Error importing question:",
          question.questionId,
          error.message
        );
      }
    }
  }

  mongoose.connection.close();
  console.log("Database connection closed");
};

// Import data from another file
const { questionData } = require("../questions/electrostatics"); // Adjust path
importQuestions(questionData.questions);
