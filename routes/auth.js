import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../services/db.js";
import { rateLimit } from "express-rate-limit";

const router = express.Router();

/**
 * Rate Limiter for login attempts to prevent brute force attacks.
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 login requests per window
    message: { error: "Too many login attempts. Please try again after 15 minutes." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

/**
 * POST /auth/signup
 * Handles user registration with input validation and password hashing.
 */
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    // 1. Basic Validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    try {
        // 2. Check for existing user
        const [existing] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: "Email already in use." });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Save to Database
        await pool.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Server error during registration." });
    }
});

/**
 * POST /auth/login
 * Verifies credentials and issues a JWT token.
 */
router.post("/login", loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        // 1. Find user
        const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const user = users[0];

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // 3. Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful.", token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error during login." });
    }
});

export default router;
