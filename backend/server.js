require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database/mysql");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

// 🔥 ROTA DE PRODUTOS (CORRIGIDA)
app.get("/produtos", (req, res) => {
  const page = Number(req.query.page) || 1;
  const limite = 12;
  const offset = (page - 1) * limite;

  const busca = req.query.busca || "";
  const categoria = req.query.categoria || "";

  let where = "WHERE ativo = 1";
  let params = [];

  // 🔍 filtro busca
  if (busca) {
    where += " AND nome LIKE ?";
    params.push(`%${busca}%`);
  }

  // 📦 filtro categoria
  if (categoria) {
    where += " AND categoria = ?";
    params.push(categoria);
  }

  // 🔥 QUERY PRINCIPAL
  db.query(
    `SELECT * FROM produtos ${where} LIMIT ? OFFSET ?`,
    [...params, limite, offset],
    (err, produtos) => {
      if (err) return res.status(500).send("Erro no banco");

      // 🔥 COUNT
      db.query(
        `SELECT COUNT(*) as total FROM produtos ${where}`,
        params,
        (err2, count) => {
          if (err2) return res.status(500).send("Erro no count");

          res.json({
            produtos,
            totalPaginas: Math.ceil(count[0].total / limite),
          });
        }
      );
    }
  );
});

// 🔥 HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});