require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const db = require("./database/mysql");

const app = express();
const SEGREDO = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// =====================
// 🔐 MIDDLEWARE ADMIN
// =====================
function verificarAdmin(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send("Sem acesso");

  try {
    const decoded = jwt.verify(token, SEGREDO);

    if (decoded.tipo !== "admin") {
      return res.status(403).send("Não é admin");
    }

    next();
  } catch {
    return res.status(401).send("Token inválido");
  }
}

// =====================
// 📸 UPLOAD
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../frontend/img"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// =====================
// 🌐 FRONTEND
// =====================
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// =====================
// 🔐 LOGIN
// =====================
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.query(
    "SELECT * FROM clientes WHERE email = ?",
    [email],
    (err, results) => {
      if (err) return res.status(500).send(err);

      const user = results[0];

      if (!user || user.senha !== senha) {
        return res.status(400).send("Email ou senha inválidos");
      }

      const token = jwt.sign(
        { id: user.id, tipo: user.tipo || "cliente" },
        SEGREDO,
        { expiresIn: "7d" }
      );

      res.json({ token, tipo: user.tipo || "cliente" });
    }
  );
});

// =====================
// 👤 CADASTRO
// =====================
app.post("/cadastro", (req, res) => {
  const { nome, email, senha, telefone } = req.body;

  db.query(
    "INSERT INTO clientes (nome, email, senha, telefone) VALUES (?, ?, ?, ?)",
    [nome, email, senha, telefone],
    (err) => {
      if (err) return res.status(400).send("Erro ao cadastrar");

      res.send("Usuário criado!");
    }
  );
});

// =====================
// 📦 PRODUTOS
// =====================
app.get("/produtos", (req, res) => {
  const page = Number(req.query.page) || 1;
  const limite = 6;
  const offset = (page - 1) * limite;

  db.query(
    "SELECT * FROM produtos WHERE ativo = 1 LIMIT ? OFFSET ?",
    [limite, offset],
    (err, produtos) => {
      if (err) return res.status(500).send(err);

      db.query(
        "SELECT COUNT(*) as total FROM produtos WHERE ativo = 1",
        (err2, count) => {
          res.json({
            produtos,
            totalPaginas: Math.ceil(count[0].total / limite)
          });
        }
      );
    }
  );
});

// ADMIN LISTAR
app.get("/produtos/admin", verificarAdmin, (req, res) => {
  db.query("SELECT * FROM produtos", (err, results) => {
    res.json(results);
  });
});

// CRIAR PRODUTO
app.post("/produtos", verificarAdmin, upload.single("imagem"), (req, res) => {
  const { nome, preco, estoque } = req.body;

  const imagem = req.file ? "/img/" + req.file.filename : "";

  db.query(
    "INSERT INTO produtos (nome, preco, estoque, imagem, ativo) VALUES (?, ?, ?, ?, 1)",
    [nome, preco, estoque, imagem],
    (err, result) => {
      if (err) return res.status(500).send(err);

      res.json({ id: result.insertId });
    }
  );
});

// ATUALIZAR
app.put("/produtos/:id", verificarAdmin, (req, res) => {
  db.query(
    "UPDATE produtos SET ? WHERE id = ?",
    [req.body, req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("Atualizado");
    }
  );
});

// DELETE
app.delete("/produtos/:id", verificarAdmin, (req, res) => {
  db.query(
    "DELETE FROM produtos WHERE id = ?",
    [req.params.id],
    () => res.send("ok")
  );
});

// =====================
// 📦 PEDIDO
// =====================
app.post("/pedido", (req, res) => {
  const { nome, telefone, endereco, total } = req.body;

  db.query(
    "INSERT INTO pedidos (nome, telefone, endereco, total) VALUES (?, ?, ?, ?)",
    [nome, telefone, endereco, total],
    () => res.send("Pedido realizado!")
  );
});

// =====================
// 📦 MEUS PEDIDOS
// =====================
app.get("/meus-pedidos", (req, res) => {
  db.query("SELECT * FROM pedidos ORDER BY id DESC", (err, results) => {
    res.json(results);
  });
});

// =====================
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});