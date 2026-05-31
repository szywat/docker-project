const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    const cachedTasks = await req.redis.get("all_tasks");

    if (cachedTasks) {
      console.log("Pobrano z Redisa");
      return res.json(JSON.parse(cachedTasks));
    }

    const { rows } = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC",
    );

    await req.redis.setEx("all_tasks", 60, JSON.stringify(rows));

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

    await req.redis.del("all_tasks");

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

    await req.redis.del("all_tasks");

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    if (rows === 0) return res.status(404).json({ error: "Nie znaleziono" });

    await req.redis.del("all_tasks");

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
