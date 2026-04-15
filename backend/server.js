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
// MODEL
// =====================
const Produto = require("./models/produtos");

// =====================
// LISTAR
// =====================
app.get("/produtos", async (req, res) => {
  const pagina = Number(req.query.page) || 1;
  const limite = 6;

  const produtos = await Produto.find()
    .skip((pagina - 1) * limite)
    .limit(limite);

  const total = await Produto.countDocuments();

  res.json({
    produtos,
    totalPaginas: Math.ceil(total / limite)
  });
});

// =====================
// CRIAR (PROTEGIDO)
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
// ATUALIZAR (PROTEGIDO)
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
// DELETE (PROTEGIDO)
// =====================
app.delete("/produtos/:id", verificarAdmin, async (req, res) => {
  await Produto.findByIdAndDelete(req.params.id);
  res.send("ok");
});

// =====================
// PORTA
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 rodando com segurança");
});