const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function setupDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      },
      multipleStatements: true
    });

    console.log("✅ Connessione ad Aiven riuscita");

    const sqlPath = path.join(__dirname, "migrations.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    await connection.query(sql);

    console.log("✅ Tabelle MeditActive create correttamente");
  } catch (error) {
    console.error("❌ Errore:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();