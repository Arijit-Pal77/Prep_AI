import express from "express";
import { callGemini } from "../services/gemini.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const userAnswer = req.body.answer;

  const prompt = `
You are an expert placement coach for Indian students.

Evaluate this answer:
"${userAnswer}"

Give output in this format:

Score:
Strength:
Weakness:
Improvement:
Ideal Answer:
`;

  const result = await callGemini(prompt, process.env.API_KEY);

  res.json({ result });
});

export default router;