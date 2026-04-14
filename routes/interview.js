import express from "express";
import { callGemini } from "../services/gemini.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        console.log("Interview Request Body:", req.body);
        const { answer, topic = "General technical", difficulty = "Moderate" } = req.body;

        let prompt = "";

        // 🎤 First question
        if (!answer) {
            prompt = `
You are a technical interviewer. Conduct a strict interview on the topic: "${topic}".
The chosen starting difficulty is: "${difficulty}".

Your task: Ask exactly ONE ${difficulty.toLowerCase()} level interview question about "${topic}".

Rules:
- Output ONLY the question text.
- No introductory text or conversational filler.
- Do NOT provide the answer or any explanation.
- Stay strictly relevant to "${topic}" and ensure the difficulty is "${difficulty}".
`;
        }
        // 🧠 Evaluate answer + Adaptive Difficulty
        else {
            prompt = `
You are a technical interviewer conducting a strict interview on the topic: "${topic}".
Current base difficulty level: "${difficulty}".

Candidate's response to the previous "${topic}" question:
"${answer}"

Evaluate the response and provide the NEXT question following this EXACT format:

Score: [X/10]
Feedback: [Briefly evaluate the answer's technical accuracy]
Improvement: [Concise tip for a better answer]

Next Question: [Ask exactly ONE next relevant question specifically about "${topic}"]

Rules:
- **Adaptive Difficulty**: If the previous answer was strong (Score 8/10 or higher), make the Next Question **significantly harder** than the previous one, even if it exceeds the base difficulty.
- **Topic Strictness**: Stay strictly focused on "${topic}".
- **No Filler**: Do NOT include any text outside of the headers above.
- **Next Question**: Focus the next question on technical depth or related ${topic} concepts.
`;
        }

        const result = await callGemini(prompt, process.env.API_KEY);
        res.json({ result });

    } catch (error) {
        console.error("AI INTERVIEW ERROR:", error);
        res.status(500).json({ result: "❌ Interview error occurred. Please try again." });
    }
});

export default router;