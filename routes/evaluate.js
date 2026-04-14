import express from "express";
import { callGemini } from "../services/gemini.js";
import pool from "../services/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const userAnswer = req.body.answer;
  const userId = req.user.id;

  const prompt = `
You are an expert placement coach for Indian students.

Evaluate this answer:
"${userAnswer}"

Give output in this format:

Score: [X/10]
Strength:
Weakness:
Improvement:
Ideal Answer:
`;

  try {
    const result = await callGemini(prompt, process.env.API_KEY);

    // 🧠 Extract score using regex
    const scoreMatch = result.match(/Score:\s*(\d+(\.\d+)?)/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;

    // 💾 Save to Database if score exists
    if (score !== null) {
        try {
            await pool.execute(
                "INSERT INTO scores (user_id, score, feedback) VALUES (?, ?, ?)",
                [userId, score, result]
            );
            console.log(`✅ Score of ${score} saved for user ${userId}`);
        } catch (dbErr) {
            console.error("DB ERROR saving score from evaluation:", dbErr);
            // We don't fail the request if DB save fails, but we log it
        }
    }

    res.json({ result });
  } catch (error) {
    console.error("AI EVALUATION ERROR:", error);
    res.status(500).json({ error: "❌ Evaluation error occurred." });
  }
});

export default router;