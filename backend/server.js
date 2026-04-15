require('dotenv').config();

require("./database/db");

const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

// =====================
// 📸 CONFIG UPLOAD
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
// MODEL
// =====================
const Produto = require("./models/produtos");

// =====================
// LISTAR
// =====================
app.get("/produtos", async (req, res) => {
  const produtos = await Produto.find();
  res.json(produtos);
});

// =====================
// CRIAR COM IMAGEM
// =====================
app.post("/produtos", upload.single("imagem"), async (req, res) => {
  try {
    const novo = new Produto({
      nome: req.body.nome,
      preco: Number(req.body.preco),
      estoque: Number(req.body.estoque),
      imagem: req.file ? "/img/" + req.file.filename : ""
    });

    await novo.save();
    res.json(novo);
  } catch (e) {
    res.status(500).send("Erro ao criar");
  }
});

// =====================
// ATUALIZAR
// =====================
app.put("/produtos/:id", async (req, res) => {
  const atualizado = await Produto.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(atualizado);
});

// =====================
// DELETE
// =====================
app.delete("/produtos/:id", async (req, res) => {
  await Produto.findByIdAndDelete(req.params.id);
  res.send("ok");
});

// =====================
// PORTA
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 rodando");
});