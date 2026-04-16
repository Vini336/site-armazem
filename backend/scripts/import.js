require('dotenv').config();

const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");

// conexão
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 Banco conectado"))
  .catch(err => console.log(err));

const Produto = require("../models/produtos");

const resultados = [];

// leitura do CSV
fs.createReadStream("../produtos.csv")
  .pipe(csv())
  .on("data", (data) => {
    resultados.push({
      nome: data.nome || data.NOME || "Produto sem nome",
      preco: Number(data.preco) || 0,
      imagem: data.imagem || "img/sem-imagem.png",
      estoque: Number(data.stock) || 0
    });
  })
  .on("end", async () => {
    try {
      // 🔥 LIMPA ANTES (ESSENCIAL)
      await Produto.deleteMany();

      // 🔥 INSERE NOVO
      await Produto.insertMany(resultados);

      console.log("🔥 Produtos importados com sucesso!");
      process.exit();
    } catch (erro) {
      console.error("Erro ao importar:", erro);
      process.exit();
    }
  });