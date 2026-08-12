require("dotenv").config();

const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");

const { get, run } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// Middleware
// ===================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

// ===================================
// Home
// ===================================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ===================================
// Signup
// ===================================

app.post("/api/signup", async (req, res) => {
  console.log("Signup request received");
  console.log(req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    const existingUser = await get("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await run("INSERT INTO users (name,email,password) VALUES (?,?,?)", [
      name,
      email,
      hashedPassword,
    ]);

    console.log("User inserted successfully.");

    res.json({
      success: true,
      message: "Signup Successful!",
    });
  } catch (err) {
    console.error("Signup Error:");
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ===================================
// Login
// ===================================

app.post("/api/login", async (req, res) => {
  console.log("Signup request received");
  console.log(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required.",
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

    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
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
    console.error("LOGIN ERROR:");
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ===================================
// Add Recipe
// ===================================

app.post("/api/addRecipe", async (req, res) => {
  console.log("Recipe Request:", req.body);

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
            (
                recipeName,
                category,
                cookingTime,
                difficulty,
                ingredients,
                instructions
            )
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

    console.log("Recipe inserted.");

    res.json({
      success: true,
      message: "Recipe added successfully!",
    });
  } catch (err) {
    console.error("Recipe Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to add recipe.",
    });
  }
});

// ===================================
// Start Server
// ===================================

app.listen(PORT, () => {
  console.log(`================================`);
  console.log(`Server running on`);
  console.log(`http://localhost:${PORT}`);
  console.log(`================================`);
});
