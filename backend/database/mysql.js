const mysql = require("mysql2");

console.log("USANDO MYSQL.JS AQUI 🔥");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "vini3368", // sua senha real
  database: "armazem",
  port: 3307 // 🔥 MUITO IMPORTANTE
});

db.connect(err => {
  if (err) {
    console.error("Erro ao conectar MySQL:", err);
  } else {
    console.log("🔥 MySQL conectado!");
  }
});

module.exports = db;