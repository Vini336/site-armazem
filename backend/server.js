require('dotenv').config();

// 🔗 CONEXÃO COM BANCO
require("./database/db");

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

const SEGREDO = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// servir frontend
app.use(express.static(path.join(__dirname, "../")));

// =========================
// 🔥 ROTA PRINCIPAL
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
// ✏️ ATUALIZAR PRODUTO
// =========================
app.put("/produtos/:id", async (req, res) => {
  try {
    const { nome, preco, imagem } = req.body;

    const produtoAtualizado = await Produto.findByIdAndUpdate(
      req.params.id,
      { nome, preco, imagem },
      { new: true }
    );

    res.json(produtoAtualizado);
  } catch (erro) {
    res.status(500).send("Erro ao atualizar produto");
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
// 🚀 PORTA
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀 na porta " + PORT);
});