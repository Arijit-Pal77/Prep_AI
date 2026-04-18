import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "prep-ai-secret-key-2024";
const DB_PATH = path.join(__dirname, "data", "users.json");
const SESSIONS_PATH = path.join(__dirname, "data", "sessions.json");

// Ensure data directory exists
async function ensureDb() {
  const dataDir = path.join(__dirname, "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify([]));
  }
  try {
    await fs.access(SESSIONS_PATH);
  } catch {
    await fs.writeFile(SESSIONS_PATH, JSON.stringify([]));
  }
}

async function getSessions() {
  const data = await fs.readFile(SESSIONS_PATH, "utf-8");
  return JSON.parse(data);
}

async function saveSessions(sessions: any[]) {
  await fs.writeFile(SESSIONS_PATH, JSON.stringify(sessions, null, 2));
}

async function getUsers() {
  const data = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(data);
}

async function saveUsers(users: any[]) {
  await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2));
}

async function startServer() {
  await ensureDb();
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

    const users = await getUsers();
    if (users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await saveUsers(users);

    res.json({ success: true, message: "User created successfully" });
  });

  app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const users = await getUsers();
    const user = users.find((u: any) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, {
      expiresIn: "24h"
    });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });

  // --- Profile Routes ---
  app.get("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const users = await getUsers();
      const user = users.find((u: any) => u.id === req.user.id);
      
      if (!user) return res.status(404).json({ error: "User not found" });

      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.put("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const { username, email } = req.body;
      const users = await getUsers();
      const userIndex = users.findIndex((u: any) => u.id === req.user.id);
      
      if (userIndex === -1) return res.status(404).json({ error: "User not found" });

      users[userIndex] = { ...users[userIndex], username, email };
      await saveUsers(users);

      res.json({ success: true, user: { username, email } });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // --- Session & Stats Routes ---
  app.post("/api/sessions", authenticateToken, async (req: any, res) => {
    try {
      const { type, topic, score, details, date, time } = req.body;
      const sessions = await getSessions();
      
      const newSession = {
        id: Date.now(),
        userId: req.user.id,
        type, // Evaluator or Interview
        topic,
        score: parseInt(score),
        details,
        date,
        time,
        createdAt: new Date().toISOString()
      };
      
      sessions.push(newSession);
      await saveSessions(sessions);
      res.json({ success: true, session: newSession });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/sessions", authenticateToken, async (req: any, res) => {
    try {
      const allSessions = await getSessions();
      const userSessions = allSessions
        .filter((s: any) => s.userId === req.user.id)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(userSessions);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/stats", authenticateToken, async (req: any, res) => {
    try {
      const allSessions = await getSessions();
      const userSessions = allSessions.filter((s: any) => s.userId === req.user.id);
      
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
      
      // Consistency (Simplified: Standard Deviation approximation or just % above 70)
      const consistency = Math.round((scores.filter((s: number) => s >= 70).length / totalAttempts) * 100);

      // Trend Analysis (Last 30)
      const trend = userSessions
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(-30)
        .map((s: any) => ({
          score: s.score,
          date: s.date
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
        activityAnalysis,
        recent: userSessions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
      });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/sessions", authenticateToken, async (req: any, res) => {
    try {
      const sessions = await getSessions();
      const filtered = sessions.filter((s: any) => s.userId !== req.user.id);
      await saveSessions(filtered);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: "frontend",
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
