const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");

// conexão
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 Banco conectado"))
  .catch(err => console.log(err));

const Produto = require("../models/produtos");

const resultados = [];

// caminho ABSOLUTO seguro
const caminhoCSV = path.resolve(__dirname, "../../data/produtos.csv");

console.log("CAMINHO CSV:", caminhoCSV); // debug

fs.createReadStream(caminhoCSV)
  .pipe(csv())
  .on("data", (data) => {

    console.log("LINHA CSV:", data);

    resultados.push({
      nome: data.Nome || data.nome || "Produto sem nome",
      preco: Number(data.Preco || data.preco || 0),
      imagem: data.Imagem || data.imagem || "img/sem-imagem.png",
      estoque: Number(data.Stock || data.estoque || 0),
      codigo: Number(data.Codigo || 0),
      qmin: Number(data.Qmin || 0),
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