require('dotenv').config();

// 🔗 CONEXÃO COM BANCO
require("./database/db");

const express = require("express");
const mongoose = require("mongoose");
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
  } catch (erro) {
    console.error(erro);
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
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao buscar produtos");
  }
});

// =========================
// 🛒 CRIAR PEDIDO (BLINDADO)
// =========================
app.post("/pedido", verificarToken, async (req, res) => {
  try {
    const { nome, telefone, endereco, itens, tipoEntrega } = req.body;

    // ✅ VALIDAÇÃO
    if (!nome || !telefone || !endereco || !itens || itens.length === 0) {
      return res.status(400).send("Dados inválidos ❌");
    }
    if (!nome || !telefone || !itens || itens.length === 0) {
  return res.status(400).send("Dados inválidos ❌");
}

    // só exige endereço se for entrega
    if (tipoEntrega === "entrega" && !endereco) {
    return res.status(400).send("Endereço obrigatório para entrega");
    }

    let totalCalculado = 0;

    // 🔥 CALCULAR TOTAL REAL (ANTI-FRAUDE)
    for (const item of itens) {
      const produto = await Produto.findOne({ nome: item.nome });

      if (!produto) {
        return res.status(400).send(`Produto não encontrado: ${item.nome}`);
      }

      if (produto.stock < item.qtd) {
        return res.status(400).send(`Estoque insuficiente para ${produto.nome}`);
      }

      totalCalculado += produto.preco * item.qtd;

      // desconta estoque
      produto.stock -= item.qtd;
      await produto.save();
    }

    const novoPedido = new Pedido({
      nome,
      telefone,
      endereco,
      itens,
      total: totalCalculado, // 🔥 usa valor seguro
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
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao buscar pedidos");
  }
});

// =========================
// 📦 STATUS DE PEDIDO
// =========================
app.put("/pedido/:id/entregue", verificarAdmin, async (req, res) => {
  try {
    await Pedido.findByIdAndUpdate(req.params.id, {
      status: "entregue"
    });
    res.send("Pedido entregue");
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro");
  }
});

app.put("/pedido/:id/separando", verificarAdmin, async (req, res) => {
  try {
    await Pedido.findByIdAndUpdate(req.params.id, {
      status: "separando"
    });
    res.send("Pedido em separação");
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro");
  }
});

app.put("/pedido/:id/saiu", verificarAdmin, async (req, res) => {
  try {
    await Pedido.findByIdAndUpdate(req.params.id, {
      status: "saiu_entrega"
    });
    res.send("Saiu para entrega");
  } catch (erro) {
    console.error(erro);
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
  } catch (erro) {
    console.error(erro);
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
  } catch (erro) {
    console.error(erro);
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

  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro no login");
  }
});

// =========================
// 👤 CADASTRO
// =========================
app.post("/cadastro", async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha || !telefone) {
      return res.status(400).send("Preencha todos os campos");
    }

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

  } catch (erro) {
    console.error(erro);
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
  } catch (erro) {
    console.error(erro);
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

      if (data >= inicioHoje) {
        totalHoje += p.total;
        pedidosHoje++;
      }

      if (data >= inicioSemana) {
        totalSemana += p.total;
      }

      p.itens.forEach(item => {
        produtosVendidos[item.nome] =
          (produtosVendidos[item.nome] || 0) + item.qtd;
      });
    });

    let maisVendido = "Nenhum";
    let max = 0;

    for (let nome in produtosVendidos) {
      if (produtosVendidos[nome] > max) {
        max = produtosVendidos[nome];
        maisVendido = nome;
      }
    }

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
    console.error(erro);
    res.status(500).send("Erro no dashboard");
  }
});

// =========================
// 🚀 START
// =========================
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000 🚀");
});