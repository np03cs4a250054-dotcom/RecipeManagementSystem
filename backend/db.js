require("dotenv").config();
const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initializeDatabase() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        publisher TEXT NOT NULL,
        year INTEGER,
        quantity INTEGER NOT NULL,
        category TEXT,
        isbn TEXT
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS members (
        memberId TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        type TEXT NOT NULL,
        address TEXT
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS issued_books (
        issueId TEXT PRIMARY KEY,

        memberId TEXT NOT NULL,
        memberName TEXT NOT NULL,

        bookId TEXT NOT NULL,
        bookTitle TEXT NOT NULL,

        issueDate TEXT NOT NULL,
        dueDate TEXT NOT NULL,

        status TEXT DEFAULT 'Issued',

        FOREIGN KEY(memberId) REFERENCES members(memberId),
        FOREIGN KEY(bookId) REFERENCES books(id)
      );
    `);

    console.log("✅ Database initialized successfully.");
  } catch (error) {
    console.error("❌ Database initialization failed:");
    console.error(error);
  }
}

initializeDatabase();

async function get(sql, args = []) {
  const result = await db.execute({
    sql,
    args,
  });

  return result.rows[0];
}

// Get Multiple Records

async function all(sql, args = []) {
  const result = await db.execute({
    sql,
    args,
  });

  return result.rows;
}

// Insert / Update / Delete

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
