import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import evaluateRoute from "./routes/evaluate.js";
import interviewRoute from "./routes/interview.js";
import scoreTrackerRoute from "./routes/score_tracker.js";
import authRoute from "./routes/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());


// Redirect base URL to auth page
app.get("/", (req, res) => {
  res.redirect("/auth.html");
});

// Serve frontend
app.use(express.static(join(__dirname, "public")));

// Use route
app.use("/evaluate", evaluateRoute);
app.use("/interview", interviewRoute);
app.use("/score-tracker", scoreTrackerRoute);
app.use("/auth", authRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});