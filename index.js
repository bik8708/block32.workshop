const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(require("cors")());

const pool = new Pool({
  connectionString: "postgres://localhost/block32_workshop",
});

// Test database connection
pool
  .connect()
  .then(() => console.log("Connected to database..."))
  .catch((err) => console.error("Database connection error", err));

// API Routes
app.get("/api/flavors", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM flavors;");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/flavors/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM flavors WHERE id = $1;", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Flavor not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/flavors", async (req, res) => {
  try {
    const { name, is_favorite } = req.body;
    const result = await pool.query(
      "INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *;",
      [name, is_favorite]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/flavors/:id", async (req, res) => {
  try {
    const { name, is_favorite } = req.body;
    const result = await pool.query(
      "UPDATE flavors SET name = $1, is_favorite = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *;",
      [name, is_favorite, req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Flavor not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/flavors/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM flavors WHERE id = $1;", [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => console.log(`Server alive on port ${port}!`));
