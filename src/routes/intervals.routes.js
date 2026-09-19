const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { goalId, startDate, endDate } = req.query;

    let sql = `
      SELECT DISTINCT
        gi.*,
        u.email,
        u.first_name,
        u.last_name
      FROM goal_intervals gi
      JOIN users u ON gi.user_id = u.id
      LEFT JOIN interval_goals ig ON gi.id = ig.interval_id
      WHERE 1 = 1
    `;

    const params = [];

    if (goalId) {
      sql += " AND ig.goal_id = ?";
      params.push(goalId);
    }

    if (startDate) {
      sql += " AND gi.start_date >= ?";
      params.push(startDate);
    }

    if (endDate) {
      sql += " AND gi.end_date <= ?";
      params.push(endDate);
    }

    sql += " ORDER BY gi.start_date DESC";

    const [intervals] = await db.execute(sql, params);

    for (const interval of intervals) {
      const [goals] = await db.execute(
        `
        SELECT
          g.id,
          g.title,
          g.description,
          g.coins_reward,
          ig.completed,
          ig.completed_at
        FROM goals g
        JOIN interval_goals ig ON g.id = ig.goal_id
        WHERE ig.interval_id = ?
        `,
        [interval.id]
      );

      interval.goals = goals;
    }

    res.status(200).json(intervals);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Errore del server" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [intervals] = await db.execute(
      `
      SELECT
        gi.*,
        u.email,
        u.first_name,
        u.last_name
      FROM goal_intervals gi
      JOIN users u ON gi.user_id = u.id
      WHERE gi.id = ?
      `,
      [req.params.id]
    );

    if (intervals.length === 0) {
      return res.status(404).json({
        error: "Intervallo non trovato"
      });
    }

    const [goals] = await db.execute(
      `
      SELECT
        g.id,
        g.title,
        g.description,
        g.coins_reward,
        ig.completed,
        ig.completed_at
      FROM goals g
      JOIN interval_goals ig ON g.id = ig.goal_id
      WHERE ig.interval_id = ?
      `,
      [req.params.id]
    );

    res.status(200).json({
      ...intervals[0],
      goals
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Errore del server"
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.body;

    if (!user_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "Dati mancanti"
      });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({
        error: "La data di fine non può precedere la data di inizio"
      });
    }

    const [users] = await db.execute(
      "SELECT id FROM users WHERE id = ?",
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: "Utente non trovato"
      });
    }

    const [result] = await db.execute(
      `
      INSERT INTO goal_intervals
      (user_id, start_date, end_date)
      VALUES (?, ?, ?)
      `,
      [user_id, start_date, end_date]
    );

    res.status(201).json({
      id: result.insertId,
      user_id,
      start_date,
      end_date
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Errore del server"
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.body;

    if (!user_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "Dati mancanti"
      });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({
        error: "La data di fine non può precedere la data di inizio"
      });
    }
const [users] = await db.execute(
  "SELECT id FROM users WHERE id = ?",
  [user_id]
);

if (users.length === 0) {
  return res.status(404).json({
    error: "Utente non trovato"
  });
}
    const [result] = await db.execute(
      `
      UPDATE goal_intervals
      SET user_id = ?, start_date = ?, end_date = ?
      WHERE id = ?
      `,
      [user_id, start_date, end_date, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Intervallo non trovato"
      });
    }

    res.status(200).json({
      message: "Intervallo aggiornato"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Errore del server"
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM goal_intervals WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Intervallo non trovato"
      });
    }

    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Errore del server"
    });
  }
});

router.post("/:id/goals", async (req, res) => {
  try {
    const { goal_id } = req.body;

    if (!goal_id) {
      return res.status(400).json({
        error: "Obiettivo mancante"
      });
    }

    const [intervals] = await db.execute(
      "SELECT id FROM goal_intervals WHERE id = ?",
      [req.params.id]
    );

    if (intervals.length === 0) {
      return res.status(404).json({
        error: "Intervallo non trovato"
      });
    }

    const [goals] = await db.execute(
      "SELECT id FROM goals WHERE id = ?",
      [goal_id]
    );

    if (goals.length === 0) {
      return res.status(404).json({
        error: "Obiettivo non trovato"
      });
    }

    const [existing] = await db.execute(
      `
      SELECT interval_id
      FROM interval_goals
      WHERE interval_id = ? AND goal_id = ?
      `,
      [req.params.id, goal_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Obiettivo già associato all'intervallo"
      });
    }

    await db.execute(
      `
      INSERT INTO interval_goals
      (interval_id, goal_id, completed, completed_at)
      VALUES (?, ?, FALSE, NULL)
      `,
      [req.params.id, goal_id]
    );

    res.status(201).json({
      message: "Obiettivo associato all'intervallo"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Errore del server"
    });
  }
});

router.put("/:intervalId/goals/:goalId/complete", async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `
      SELECT
        ig.completed,
        g.coins_reward,
        gi.user_id
      FROM interval_goals ig
      JOIN goals g ON g.id = ig.goal_id
      JOIN goal_intervals gi ON gi.id = ig.interval_id
      WHERE ig.interval_id = ? AND ig.goal_id = ?
      FOR UPDATE
      `,
      [req.params.intervalId, req.params.goalId]
    );

    if (rows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        error: "Obiettivo associato non trovato"
      });
    }

    const association = rows[0];

    if (association.completed) {
      await connection.rollback();

      return res.status(409).json({
        error: "Obiettivo già completato"
      });
    }

    await connection.execute(
      `
      UPDATE interval_goals
      SET completed = TRUE,
          completed_at = NOW()
      WHERE interval_id = ? AND goal_id = ?
      `,
      [req.params.intervalId, req.params.goalId]
    );

    await connection.execute(
      `
      UPDATE users
      SET coins = coins + ?
      WHERE id = ?
      `,
      [association.coins_reward, association.user_id]
    );

    await connection.commit();

    res.status(200).json({
      message: "Obiettivo completato",
      reward: association.coins_reward
    });
  } catch (error) {
    await connection.rollback();
    console.log(error);

    res.status(500).json({
      error: "Errore del server"
    });
  } finally {
    connection.release();
  }
});

router.delete("/:id/goals/:goalId", async (req, res) => {
  try {
    const [result] = await db.execute(
      `
      DELETE FROM interval_goals
      WHERE interval_id = ? AND goal_id = ?
      `,
      [req.params.id, req.params.goalId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Associazione non trovata"
      });
    }

    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Errore del server"
    });
  }
});

module.exports = router;