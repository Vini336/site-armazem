const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");

// 🔥 conexão com banco
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 Banco conectado"))
  .catch(err => console.log(err));

const Produto = require("../models/produtos");

const resultados = [];

// 🔥 caminho correto do CSV
const caminhoCSV = path.resolve(__dirname, "../../data/produtos.csv");

console.log("CAMINHO CSV:", caminhoCSV);

// 🔥 leitura do CSV (vírgula agora)
fs.createReadStream(caminhoCSV)
  .pipe(csv()) // ✅ agora é vírgula
  .on("data", (data) => {

    console.log("LINHA CSV:", data);

    resultados.push({
      nome: data.nome || data.NOME || "Produto sem nome",

      preco: parseFloat(
        (data.preco || data.PRECO || "0")
          .toString()
          .replace(",", ".")
      ) || 0,

      imagem: data.imagem || data.IMAGEM || "img/sem-imagem.png",

      // 🔥 CORREÇÃO DO ESTOQUE (resolve NaN)
      estoque: parseFloat(
        (data.stock || data.STOCK || "0")
          .toString()
          .replace(",", ".")
          .replace("(", "-")
          .replace(")", "")
      ) || 0,

      codigo: Number(data.codigo || data.CODIGO || 0),

      qmin: parseFloat(
        (data.qmin || data.QMIN || "0")
          .toString()
          .replace(",", ".")
      ) || 0,

      ativo: true
    });
  })
  .on("end", async () => {
    try {
      await Produto.deleteMany();
      await Produto.insertMany(resultados);

      console.log("🔥 Produtos importados com sucesso!");
      process.exit();
    } catch (erro) {
      console.error("Erro ao importar:", erro);
      process.exit();
    }
  });