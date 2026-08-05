// db.js
require("dotenv").config();
const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Create table if it doesn't exist
async function init() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Database connected successfully (Turso)");
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
  }
}

// Get one row
async function get(sql, args = []) {
  const result = await db.execute({
    sql,
    args,
  });

  return result.rows[0];
}

// Get all rows
async function all(sql, args = []) {
  const result = await db.execute({
    sql,
    args,
  });

  return result.rows;
}

// Insert, Update, Delete
async function run(sql, args = []) {
  const result = await db.execute({
    sql,
    args,
  });

  return {
    lastInsertRowid:
      result.lastInsertRowid != null
        ? Number(result.lastInsertRowid)
        : null,
    changes: result.rowsAffected,
  };
}

// Initialize database
init();

module.exports = {
  db,
  get,
  all,
  run,
};