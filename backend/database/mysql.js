require("dotenv").config();
const mysql = require("mysql2");

console.log("USANDO MYSQL POOL 🔥");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "armazem",
  port: process.env.DB_PORT || 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 🔥 teste de conexão
db.getConnection((err, conn) => {
  if (err) {
    console.error("Erro ao conectar MySQL:", err);
  } else {
    console.log("🔥 MySQL conectado!");
    conn.release();
  }
});

module.exports = db;