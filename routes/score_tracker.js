import express from "express";

const router = express.Router();

// Server-side storage (persisted in RAM while server is running)
let scoreHistory = [];

/**
 * GET /score-tracker
 * Retrieves the full score history.
 */
router.get("/", (req, res) => {
    res.json(scoreHistory);
});

/**
 * POST /score-tracker/add
 * Adds a new score to the history with duplicate prevention.
 */
router.post("/add", (req, res) => {
    const { score } = req.body;

    if (!score) {
        return res.status(400).json({ error: "Score is required" });
    }

    // Duplicate check: prevent the exact same score from being added consecutively
    if (scoreHistory.length === 0 || scoreHistory[scoreHistory.length - 1] !== score) {
        scoreHistory.push(score);
        console.log(`✅ Score recorded: ${score}/10`);
        return res.json({ success: true, history: scoreHistory });
    }

    res.json({ success: true, message: "Duplicate score skipped", history: scoreHistory });
});

/**
 * DELETE /score-tracker/reset
 * Optional: Clears the history.
 */
router.delete("/reset", (req, res) => {
    scoreHistory = [];
    res.json({ success: true, message: "History cleared" });
});

export default router;
