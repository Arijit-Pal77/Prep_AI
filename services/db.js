import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

/**
 * Database connection pool using mysql2/promise.
 * Configuration is pulled from environment variables.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test the connection on startup
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ MySQL Database Connected Successfully.");
        connection.release();
    } catch (err) {
        console.error("❌ Database Connection Failed:", err.message);
        console.warn("⚠️  Make sure you have created the 'prep_ai' database and your .env credentials are correct.");
    }
})();

export default pool;
