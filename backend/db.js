require("dotenv").config();
const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_DATABASE_TOKEN,
});

async function initializeDatabase() {
  try {
    // ===============================
    // Users Table
    // ===============================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ===============================
    // Recipes Table
    // ===============================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipeName TEXT NOT NULL,
        category TEXT NOT NULL,
        cookingTime TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ===============================
    // Contact Messages
    // ===============================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ===============================
    // Favorite Recipes
    // ===============================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        recipe_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(recipe_id) REFERENCES recipes(id)
      );
    `);

    console.log("✅ Database initialized successfully.");
  } catch (error) {
    console.error("❌ Database initialization failed:");
    console.error(error);
  }
}

initializeDatabase();

// ===============================
// Get One Record
// ===============================
async function get(sql, args = []) {
  const result = await db.execute({
    sql,
    args,
  });

  return result.rows[0];
}

// ===============================
// Get Multiple Records
// ===============================
async function all(sql, args = []) {
  const result = await db.execute({
    sql,
    args,
  });

  return result.rows;
}

// ===============================
// Insert / Update / Delete
// ===============================
async function run(sql, args = []) {
  const result = await db.execute({
    sql,
    args,
  });

  return {
    lastInsertRowid:
      result.lastInsertRowid != null ? Number(result.lastInsertRowid) : null,
    changes: result.rowsAffected,
  };
}

module.exports = {
  db,
  get,
  all,
  run,
};
