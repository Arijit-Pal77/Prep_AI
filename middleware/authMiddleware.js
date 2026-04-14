import jwt from "jsonwebtoken";

/**
 * Authentication Middleware
 * 
 * Protects routes by verifying the JWT token provided in the Authorization header.
 * Attaches the user payload to the request object if valid.
 */
const authMiddleware = (req, res, next) => {
    // Get token from header (Format: Bearer <token>)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info (id, email) to request
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token." });
    }
};

export default authMiddleware;
