const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM users ORDER BY id DESC"
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Errore interno del server"
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Utente non trovato"
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Errore interno del server"
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, first_name, last_name } = req.body;

    if (!email || !first_name || !last_name) {
      return res.status(400).json({
        error: "Dati mancanti"
      });
    }

    const [result] = await db.execute(
      "INSERT INTO users (email, first_name, last_name) VALUES (?, ?, ?)",
      [email, first_name, last_name]
    );

    res.status(201).json({
      id: result.insertId,
      email,
      first_name,
      last_name
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
    const { email, first_name, last_name } = req.body;

    if (!email || !first_name || !last_name) {
      return res.status(400).json({
        error: "Dati mancanti"
      });
    }

    const [result] = await db.execute(
      "UPDATE users SET email = ?, first_name = ?, last_name = ? WHERE id = ?",
      [email, first_name, last_name, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Utente non trovato"
      });
    }

    res.status(200).json({
      message: "Utente aggiornato"
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
      "DELETE FROM users WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Utente non trovato"
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