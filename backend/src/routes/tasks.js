const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post("/", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Tytuł jest wymagany" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [title],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "UPDATE tasks SET done = NOT done WHERE id = $1 RETURNING *",
      [id],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Nie znaleziono" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
