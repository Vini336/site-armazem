require('dotenv').config();

// 🔗 CONEXÃO COM BANCO
require("./database/db");

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

const SEGREDO = process.env.JWT_SECRET;

// =========================
// 🔐 MIDDLEWARE TOKEN
// =========================
function verificarToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send("Acesso negado 🔒");

  try {
    const decoded = jwt.verify(token, SEGREDO);
    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).send("Token inválido ❌");
  }
}

function verificarAdmin(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send("Acesso negado 🔒");

  try {
    const decoded = jwt.verify(token, SEGREDO);

    if (decoded.tipo !== "admin") {
      return res.status(403).send("Apenas administradores 🚫");
    }

    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).send("Token inválido ❌");
  }
}

app.use(cors());
app.use(express.json());

const path = require("path");

// servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, "../")));

// =========================
// 🔥 ROTA PRINCIPAL (IMPORTANTE)
// =========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// =========================
// 📦 MODELS
// =========================
const Produto = require("./models/produtos");
const Pedido = require("./models/pedido");
const Usuario = require("./models/usuario");

// =========================
// 📦 LISTAR PRODUTOS
// =========================
app.get("/produtos", async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (erro) {
    res.status(500).send("Erro ao buscar produtos");
  }
});

// =========================
// 👤 LOGIN
// =========================
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ email });

    if (!usuario) return res.status(400).send("Usuário não encontrado");

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) return res.status(400).send("Senha incorreta");

    const token = jwt.sign(
      { id: usuario._id, tipo: usuario.tipo },
      SEGREDO,
      { expiresIn: "7d" }
    );

    res.json({ token, tipo: usuario.tipo });

  } catch {
    res.status(500).send("Erro no login");
  }
});

// =========================
// 🚀 PORTA CORRETA (ESSENCIAL)
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀 na porta " + PORT);
});