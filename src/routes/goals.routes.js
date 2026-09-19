const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        g.id,
        g.title,
        g.description,
        g.coins_reward,
        g.created_at,
        gi.id AS interval_id,
        gi.start_date,
        gi.end_date,
        u.id AS user_id,
        u.first_name,
        u.last_name
      FROM goals g
      LEFT JOIN interval_goals ig ON g.id = ig.goal_id
      LEFT JOIN goal_intervals gi ON ig.interval_id = gi.id
      LEFT JOIN users u ON gi.user_id = u.id
      ORDER BY g.id DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Errore interno del server"
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, coins_reward } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "Titolo obbligatorio"
      });
    }

    const [result] = await db.execute(
      "INSERT INTO goals (title, description, coins_reward) VALUES (?, ?, ?)",
      [title, description || null, coins_reward || 0]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      coins_reward: coins_reward || 0
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Errore interno del server"
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, description, coins_reward } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "Titolo obbligatorio"
      });
    }

    const [result] = await db.execute(
      "UPDATE goals SET title = ?, description = ?, coins_reward = ? WHERE id = ?",
      [title, description || null, coins_reward || 0, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Obiettivo non trovato"
      });
    }

    res.status(200).json({
      message: "Obiettivo aggiornato"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Errore interno del server"
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM goals WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Obiettivo non trovato"
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Errore interno del server"
    });
  }
});

module.exports = router;