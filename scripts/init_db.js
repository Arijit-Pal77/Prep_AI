import pool from "../services/db.js";

async function initDB() {
  try {
    console.log("🚀 Initializing scores table...");

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED,
        score FLOAT,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;

    const createIndexQuery = `
      CREATE INDEX idx_user_id ON scores(user_id);
    `;

    // 1. Create Table
    await pool.execute(createTableQuery);
    console.log("✅ Table 'scores' created successfully.");

    // 2. Create Index (Check if exists first or just try/catch)
    try {
      await pool.execute(createIndexQuery);
      console.log("✅ Index 'idx_user_id' created successfully.");
    } catch (indexErr) {
      if (indexErr.code === 'ER_DUP_KEYNAME') {
        console.log("ℹ️ Index 'idx_user_id' already exists.");
      } else {
        throw indexErr;
      }
    }

    console.log("🎊 Database initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
}

initDB();
