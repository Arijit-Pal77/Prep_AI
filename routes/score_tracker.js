import express from "express";
import pool from "../services/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /score-tracker
 * Retrieves the full score history for the authenticated user from the database.
 */
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await pool.execute(
            "SELECT id, score, feedback, created_at FROM scores WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("DB ERROR fetching history:", error);
        res.status(500).json({ error: "Server error fetching history." });
    }
});

/**
 * POST /score-tracker/add
 * Manually adds a new score to the history (if needed).
 */
router.post("/add", authMiddleware, async (req, res) => {
    const { score, feedback } = req.body;
    const userId = req.user.id;

    if (score === undefined) {
        return res.status(400).json({ error: "Score is required" });
    }

    try {
        await pool.execute(
            "INSERT INTO scores (user_id, score, feedback) VALUES (?, ?, ?)",
            [userId, score, feedback || ""]
        );

        res.json({ success: true, message: "Score recorded successfully." });
    } catch (error) {
        console.error("DB ERROR saving score:", error);
        res.status(500).json({ error: "Server error saving score." });
    }
});

/**
 * DELETE /score-tracker/reset
 * Clears the history for the authenticated user.
 */
router.delete("/reset", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        await pool.execute("DELETE FROM scores WHERE user_id = ?", [userId]);
        res.json({ success: true, message: "History cleared." });
    } catch (error) {
        console.error("DB ERROR clearing history:", error);
        res.status(500).json({ error: "Server error clearing history." });
    }
});

export default router;
