require('dotenv').config();

console.log("MONGO_URI:", process.env.MONGO_URI);

const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");

// 🔥 CONECTA COM SEU MONGODB ATLAS (do .env)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 Banco conectado"))
  .catch(err => console.log(err));

// ✅ caminho corrigido do model
const Produto = require("../models/produtos");

const resultados = [];

// ✅ caminho corrigido do CSV (ele está fora da pasta backend)
fs.createReadStream("../produtos.csv")
  .pipe(csv())
  .on("data", (data) => {
    resultados.push({
      nome: data.nome || data.NOME,
      codigo: data.CODIGO || data.codigo,
      preco: 0,
      imagem: ""
    });
  })
  .on("end", async () => {
    await Produto.insertMany(resultados);
    console.log("🔥 Produtos importados com sucesso!");
    process.exit();
  });