// 🔗 CONEXÃO COM BANCO
require("./database/db");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

const SEGREDO = "segredo_super_forte_123";

// =========================
// 🔐 MIDDLEWARE TOKEN
// =========================
function verificarToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send("Acesso negado 🔒");
  }

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

  if (!token) {
    return res.status(401).send("Acesso negado 🔒");
  }

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

// =========================
// 📦 MODELS
// =========================
const Produto = require("./models/produtos");
const Pedido = require("./models/pedido");
const Usuario = require("./models/usuario");

// =========================
// 📦 CRIAR PRODUTO
// =========================
app.post("/produto", async (req, res) => {
  try {
    const novoProduto = new Produto(req.body);
    await novoProduto.save();
    res.send("Produto criado com sucesso 🔥");
  } catch {
    res.status(500).send("Erro ao criar produto");
  }
});

// =========================
// 📦 LISTAR PRODUTOS
// =========================
app.get("/produtos", async (req, res) => {
  try {
    const pagina = parseInt(req.query.page) || 0;
    const limite = 24;

    const produtos = await Produto
      .find()
      .skip(pagina * limite)
      .limit(limite);

    res.json(produtos);
  } catch {
    res.status(500).send("Erro ao buscar produtos");
  }
});

// =========================
// 🛒 CRIAR PEDIDO
// =========================
app.post("/pedido", verificarToken, async (req, res) => {
  try {
    const { nome, telefone, endereco, itens, total } = req.body;

    for (const item of itens) {
      const produto = await Produto.findOne({ nome: item.nome });

      if (!produto) continue;

      if (produto.stock < item.qtd) {
        return res.status(400).send(`Estoque insuficiente para ${produto.nome}`);
      }

      produto.stock -= item.qtd;
      await produto.save();
    }

    const novoPedido = new Pedido({
      nome,
      telefone,
      endereco,
      itens,
      total,
      data: new Date(),
      status: "pendente",
      usuarioId: req.usuario.id
    });

    await novoPedido.save();

    res.send("Pedido salvo com sucesso 🛒");

  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao salvar pedido");
  }
});

// =========================
// 📦 LISTAR PEDIDOS
// =========================
app.get("/pedidos", verificarAdmin, async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ data: -1 });
    res.json(pedidos);
  } catch {
    res.status(500).send("Erro ao buscar pedidos");
  }
});

// =========================
// 📦 STATUS DE PEDIDO
// =========================

// ✅ ENTREGUE
app.put("/pedido/:id/entregue", verificarAdmin, async (req, res) => {
  try {
    await Pedido.findByIdAndUpdate(req.params.id, {
      status: "entregue"
    });
    res.send("Pedido entregue");
  } catch {
    res.status(500).send("Erro");
  }
});

// 📦 SEPARANDO
app.put("/pedido/:id/separando", verificarAdmin, async (req, res) => {
  try {
    await Pedido.findByIdAndUpdate(req.params.id, {
      status: "separando"
    });
    res.send("Pedido em separação");
  } catch {
    res.status(500).send("Erro");
  }
});

// 🚚 SAIU PARA ENTREGA
app.put("/pedido/:id/saiu", verificarAdmin, async (req, res) => {
  try {
    await Pedido.findByIdAndUpdate(req.params.id, {
      status: "saiu_entrega"
    });
    res.send("Saiu para entrega");
  } catch {
    res.status(500).send("Erro");
  }
});

// =========================
// 💳 PAGAMENTO
// =========================
app.put("/pedido/:id/pago", verificarAdmin, async (req, res) => {
  try {
    await Pedido.findByIdAndUpdate(req.params.id, {
      statusPagamento: "pago"
    });
    res.send("Pagamento confirmado 💰");
  } catch {
    res.status(500).send("Erro");
  }
});

// =========================
// 🗑️ DELETAR PEDIDO
// =========================
app.delete("/pedido/:id", verificarAdmin, async (req, res) => {
  try {
    await Pedido.findByIdAndDelete(req.params.id);
    res.send("Pedido deletado");
  } catch {
    res.status(500).send("Erro");
  }
});

// =========================
// 👤 LOGIN
// =========================
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(400).send("Usuário não encontrado");
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).send("Senha incorreta");
    }

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
// 👤 CADASTRO
// =========================
app.post("/cadastro", async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;

    const existe = await Usuario.findOne({ email });

    if (existe) {
      return res.status(400).send("Email já cadastrado");
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = new Usuario({
      nome,
      email,
      senha: senhaHash,
      telefone,
      tipo: "cliente"
    });

    await novoUsuario.save();

    res.send("Cadastro realizado com sucesso 🎉");

  } catch {
    res.status(500).send("Erro ao cadastrar");
  }
});

// =========================
// 📦 MEUS PEDIDOS
// =========================
app.get("/meus-pedidos", verificarToken, async (req, res) => {
  try {
    const pedidos = await Pedido.find({
      usuarioId: req.usuario.id
    }).sort({ data: -1 });

    res.json(pedidos);
  } catch {
    res.status(500).send("Erro ao buscar pedidos");
  }
});

// =========================
// 📊 DASHBOARD
// =========================
app.get("/dashboard", verificarAdmin, async (req, res) => {
  try {
    const pedidos = await Pedido.find();

    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - 7);

    let totalHoje = 0;
    let totalSemana = 0;
    let pedidosHoje = 0;

    const produtosVendidos = {};

    pedidos.forEach(p => {
      const data = new Date(p.data);

      // 📅 HOJE
      if (data >= inicioHoje) {
        totalHoje += p.total;
        pedidosHoje++;
      }

      // 📅 SEMANA
      if (data >= inicioSemana) {
        totalSemana += p.total;
      }

      // 🛒 PRODUTOS
      p.itens.forEach(item => {
        produtosVendidos[item.nome] =
          (produtosVendidos[item.nome] || 0) + item.qtd;
      });
    });

    // 🏆 MAIS VENDIDO
    let maisVendido = "Nenhum";
    let max = 0;

    for (let nome in produtosVendidos) {
      if (produtosVendidos[nome] > max) {
        max = produtosVendidos[nome];
        maisVendido = nome;
      }
    }

    // 📉 TICKET MÉDIO
    const ticketMedio = pedidos.length
      ? pedidos.reduce((acc, p) => acc + p.total, 0) / pedidos.length
      : 0;

    res.json({
      totalHoje,
      totalSemana,
      pedidosHoje,
      maisVendido,
      ticketMedio
    });

  } catch (erro) {
    res.status(500).send("Erro no dashboard");
  }
});

// =========================
// 🚀 START
// =========================
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000 🚀");
});