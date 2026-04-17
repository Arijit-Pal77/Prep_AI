import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pool from "./src/lib/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "prep-ai-secret-key-2024";
const DB_PATH = path.join(__dirname, "data", "users.json");

async function startServer() {
  const app = express();
  app.use(express.json());

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
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
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
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- Profile Routes ---
  app.get("/api/profile", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const [users]: any = await pool.query("SELECT * FROM users WHERE id = ?", [decoded.id]);
      const user = users[0];
      
      if (!user) return res.status(404).json({ error: "User not found" });

      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.put("/api/profile", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { username, email } = req.body;

      await pool.query(
        "UPDATE users SET username = ?, email = ? WHERE id = ?",
        [username, email, decoded.id]
      );

      res.json({ success: true, user: { username, email } });
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // --- History/Sessions Routes ---
  app.get("/api/history", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const [history]: any = await pool.query(
        "SELECT * FROM scores WHERE user_id = ? ORDER BY created_at DESC",
        [decoded.id]
      );
      res.json(history);
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Alias for legacy support and new detailed history
  app.post(["/api/history", "/api/sessions"], async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { type, score, topic, details, date, time } = req.body;

      const finalDate = date || new Date().toISOString().split("T")[0];
      const finalTime = time || new Date().toTimeString().split(" ")[0];

      await pool.query(
        "INSERT INTO scores (user_id, type, score, topic, details, date, time) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [decoded.id, type, score, topic, details || "", finalDate, finalTime]
      );

      res.json({ success: true });
    } catch (err) {
      console.error("Error saving session:", err);
      res.status(500).json({ error: "Failed to save session" });
    }
  });

  // Analytics Stats Endpoint
  app.get("/api/stats", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;

      // 1. Overview Stats
      const [overview]: any = await pool.query(
        `SELECT 
            COUNT(*) as totalAttempts,
            COALESCE(ROUND(AVG(score)), 0) as avgScore,
            COALESCE(MAX(score), 0) as recordHigh
         FROM scores WHERE user_id = ?`,
        [userId]
      );

      // 2. Trend Data (Last 30 sessions)
      const [trend]: any = await pool.query(
        `SELECT score, date 
         FROM (
           SELECT score, date, created_at 
           FROM scores 
           WHERE user_id = ? 
           ORDER BY created_at DESC 
           LIMIT 30
         ) sub 
         ORDER BY created_at ASC`,
        [userId]
      );

      // 3. Topic Analysis
      const [topicAnalysis]: any = await pool.query(
        `SELECT topic, ROUND(AVG(score)) as avgScore, COUNT(*) as count
         FROM scores 
         WHERE user_id = ? 
         GROUP BY topic 
         ORDER BY avgScore DESC`,
        [userId]
      );

      // Consistency calculation (simple logic based on frequency of scores in last 7 entries)
      const consistency = trend.length > 5 ? 85 : 40; // Placeholder for now

      res.json({
        overview: {
          ...overview[0],
          consistency
        },
        trend,
        topicAnalysis
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // --- Health Check for Uptime Monitoring ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Prep AI Server running at http://localhost:${PORT}`);
  });
}

startServer();
