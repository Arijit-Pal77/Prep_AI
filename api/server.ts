import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "prep-ai-secret-key-2024";

const app = express();
app.use(express.json());

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
  
  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post("/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [existingUsers]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Date.now().toString();
    
    await pool.query(
      "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)",
      [id, username, email, hashedPassword]
    );

    res.json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error during signup" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, {
      expiresIn: "24h"
    });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// --- Profile Routes ---
app.get("/api/profile", authenticateToken, async (req: any, res) => {
  try {
    const [users]: any = await pool.query("SELECT id, username, email, createdAt FROM users WHERE id = ?", [req.user.id]);
    const user = users[0];
    
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/profile", authenticateToken, async (req: any, res) => {
  try {
    const { username, email } = req.body;
    await pool.query("UPDATE users SET username = ?, email = ? WHERE id = ?", [username, email, req.user.id]);
    res.json({ success: true, user: { username, email } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- Session & Stats Routes ---
app.post("/api/sessions", authenticateToken, async (req: any, res) => {
  try {
    const { type, topic, score, details, date, time } = req.body;
    
    await pool.query(
      "INSERT INTO scores (user_id, type, topic, score, details, date, time) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, type, topic, parseInt(score), details, date, time]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error("Session save error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/stats", authenticateToken, async (req: any, res) => {
  try {
    const [userSessions]: any = await pool.query(
      "SELECT * FROM scores WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    
    if (userSessions.length === 0) {
      return res.json({
        overview: { totalAttempts: 0, avgScore: 0, recordHigh: 0, consistency: 0 },
        trend: [],
        topicAnalysis: [],
        activityAnalysis: []
      });
    }

    // Overview
    const scores = userSessions.map((s: any) => s.score);
    const totalAttempts = userSessions.length;
    const avgScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / totalAttempts);
    const recordHigh = Math.max(...scores);
    const consistency = Math.round((scores.filter((s: number) => s >= 70).length / totalAttempts) * 100);

    // Trend Analysis (Last 30)
    const trend = [...userSessions]
      .reverse()
      .slice(-30)
      .map((s: any) => ({
        score: s.score,
        date: s.date.toISOString().split('T')[0]
      }));

    // Topic Analysis
    const topicsMap = userSessions.reduce((acc: any, s: any) => {
      if (!acc[s.topic]) acc[s.topic] = { totalScore: 0, count: 0 };
      acc[s.topic].totalScore += s.score;
      acc[s.topic].count += 1;
      return acc;
    }, {});

    const topicAnalysis = Object.entries(topicsMap).map(([topic, data]: [string, any]) => ({
      topic,
      avgScore: Math.round(data.totalScore / data.count)
    })).sort((a, b) => b.avgScore - a.avgScore);

    const activityAnalysis = Object.entries(topicsMap).map(([topic, data]: [string, any]) => ({
      topic,
      count: data.count
    })).sort((a, b) => b.count - a.count);

    res.json({
      overview: { totalAttempts, avgScore, recordHigh, consistency },
      trend,
      topicAnalysis,
      activityAnalysis
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/sessions", authenticateToken, async (req: any, res) => {
  try {
    await pool.query("DELETE FROM scores WHERE user_id = ?", [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- Development/Local Logic ---
if (process.env.NODE_ENV !== "production") {
  // Use dynamic import for Vite so it's not bundled in production serverless functions
  const startDevServer = async () => {
    try {
      const { createServer } = await import("vite");
      const vite = await createServer({
        root: "frontend",
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      const PORT = 3000;
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Prep AI Development Server running at http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error("Failed to load Vite in development:", err);
    }
  };
  startDevServer();
}

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Error Handler Catch:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
});

// Export the app instance for Vercel
export default app;
