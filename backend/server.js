require("dotenv").config();

const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");

const { get, run } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// Middleware
// ===============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

// ===============================
// Home
// ===============================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ===============================
// Signup
// ===============================

app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    const existing = await get("SELECT id FROM users WHERE email = ?", [email]);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await run("INSERT INTO users (name,email,password) VALUES (?,?,?)", [
      name,
      email,
      hashedPassword,
    ]);

    res.json({
      success: true,
      message: "Account created successfully!",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Signup failed.",
    });
  }
});

// ===============================
// Login
// ===============================

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    const user = await get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const match = bcrypt.compareSync(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    res.json({
      success: true,
      message: `Welcome back ${user.name}!`,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
});

// ===============================
// Add Recipe
// ===============================

app.post("/api/addRecipe", async (req, res) => {
  const {
    recipeName,
    category,
    cookingTime,
    difficulty,
    ingredients,
    instructions,
  } = req.body;

  if (
    !recipeName ||
    !category ||
    !cookingTime ||
    !difficulty ||
    !ingredients ||
    !instructions
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields.",
    });
  }

  try {
    await run(
      `INSERT INTO recipes
            (recipeName, category, cookingTime, difficulty, ingredients, instructions)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [
        recipeName,
        category,
        cookingTime,
        difficulty,
        ingredients,
        instructions,
      ],
    );

    res.json({
      success: true,
      message: "Recipe added successfully!",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to add recipe.",
    });
  }
});

// ===============================
// Start Server
// ===============================

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
