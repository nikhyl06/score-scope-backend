const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();


app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://score-scope-frontend.vercel.app"
        : "http://localhost:5173",
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/questions", require("./routes/questions"));
app.use("/api/tests", require("./routes/tests"));
app.use("/api/results", require("./routes/results"));
app.use("/api/study-plan", require("./routes/studyPlan"));
app.use("/api/profile", require("./routes/profile"));

// Error Handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
