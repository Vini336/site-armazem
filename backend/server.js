require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database/mysql");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 CORREÇÃO AQUI
app.use(express.static(path.join(__dirname, "../frontend")));

// 🔥 ROTA DE PRODUTOS
app.get("/produtos", (req, res) => {
  const page = Number(req.query.page) || 1;
  const limite = 12;
  const offset = (page - 1) * limite;

  const busca = req.query.busca || "";

  db.query(
    "SELECT * FROM produtos WHERE ativo = 1 AND nome LIKE ? LIMIT ? OFFSET ?",
    [`%${busca}%`, limite, offset],
    (err, produtos) => {
      if (err) return res.status(500).send("Erro no banco");

      db.query(
        "SELECT COUNT(*) as total FROM produtos WHERE ativo = 1 AND nome LIKE ?",
        [`%${busca}%`],
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

// 🔥 FAZ / ABRIR O SITE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// 🔥 SERVIDOR
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});