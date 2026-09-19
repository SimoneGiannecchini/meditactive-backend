const express = require("express");
const cors = require("cors");
require("dotenv").config();

const usersRoutes = require("./routes/users.routes");
const goalsRoutes = require("./routes/goals.routes");
const intervalsRoutes = require("./routes/intervals.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/intervals", intervalsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Risorsa non trovata" });
});

module.exports = app;