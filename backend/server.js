require('dotenv').config();
require("./database/db");

const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const jwt = require("jsonwebtoken");

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
    cb(null, path.join(__dirname, "../img"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// =====================
// FRONTEND
// =====================
app.use(express.static(path.join(__dirname, "../")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// =====================
// MODELS
// =====================
const Produto = require("./models/produtos");
const Pedido = require("./models/pedido");

// =====================
// 📦 LISTAR PRODUTOS
// =====================
app.get("/produtos", async (req, res) => {
  const pagina = Number(req.query.page) || 1;
  const limite = 6;

  const produtos = await Produto.find({ ativo: true })
    .skip((pagina - 1) * limite)
    .limit(limite);

  const total = await Produto.countDocuments({ ativo: true });

  res.json({
    produtos,
    totalPaginas: Math.ceil(total / limite)
  });
});

// =====================
// ➕ CRIAR PRODUTO
// =====================
app.post("/produtos", verificarAdmin, upload.single("imagem"), async (req, res) => {
  try {
    const novo = new Produto({
      nome: req.body.nome,
      preco: Number(req.body.preco),
      estoque: Number(req.body.estoque),
      imagem: req.file ? "/img/" + req.file.filename : ""
    });

    await novo.save();
    res.json(novo);
  } catch {
    res.status(500).send("Erro ao criar");
  }
});

// =====================
// ✏️ ATUALIZAR PRODUTO
// =====================
app.put("/produtos/:id", verificarAdmin, async (req, res) => {
  const atualizado = await Produto.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(atualizado);
});

// =====================
// 🗑 DELETE PRODUTO
// =====================
app.delete("/produtos/:id", verificarAdmin, async (req, res) => {
  await Produto.findByIdAndDelete(req.params.id);
  res.send("ok");
});

// =====================
// 🔥 CORRIGIR PRODUTOS
// =====================
// =====================
// 🔥 ATIVAR TODOS PRODUTOS (TEMP)
// =====================
app.get("/ativar-produtos", async (req, res) => {
  try {
    const resultado = await Produto.updateMany(
      {},
      { $set: { ativo: true } }
    );

    res.send(`✅ ${resultado.modifiedCount} produtos ativados`);
  } catch (erro) {
    res.status(500).send("Erro ao ativar produtos");
  }
});

// =====================
// 🔘 ATIVAR / DESATIVAR INDIVIDUAL
// =====================
app.put("/produtos/:id/ativar", verificarAdmin, async (req, res) => {
  const produto = await Produto.findByIdAndUpdate(
    req.params.id,
    { ativo: true },
    { new: true }
  );

  res.json(produto);
});

app.put("/produtos/:id/desativar", verificarAdmin, async (req, res) => {
  const produto = await Produto.findByIdAndUpdate(
    req.params.id,
    { ativo: false },
    { new: true }
  );

  res.json(produto);
});

// =====================
// 📦 PEDIDOS (COM ESTOQUE)
// =====================
app.post("/pedido", async (req, res) => {
  try {
    const { itens, total, nome, telefone, endereco } = req.body;

    // 🔒 VERIFICAR ESTOQUE
    for (let item of itens) {
      const produto = await Produto.findById(item.id);

      if (!produto || produto.estoque < item.qtd) {
        return res.status(400).send(`Produto ${produto?.nome || ""} sem estoque suficiente`);
      }
    }

    // 📉 DESCONTAR ESTOQUE
    for (let item of itens) {
      await Produto.findByIdAndUpdate(item.id, {
        $inc: { estoque: -item.qtd }
      });
    }

    // 💾 SALVAR PEDIDO
    const novoPedido = new Pedido({
      nome,
      telefone,
      endereco,
      itens,
      total
    });

    await novoPedido.save();

    res.send("Pedido realizado com sucesso!");
  } catch (erro) {
    res.status(500).send("Erro ao finalizar pedido");
  }
});

// =====================
// 🚀 PORTA
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 rodando com segurança");
});