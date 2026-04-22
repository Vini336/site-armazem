const fs = require("fs");
const csv = require("csv-parser");
const db = require("./database/mysql");

const resultados = [];

fs.createReadStream("./data/produtos.csv")
  .pipe(csv({ separator: ";" }))
  .on("data", (data) => {
    // 🔥 FILTRO INTELIGENTE (ESSA É A CHAVE)
    if (!data.nome || data.nome.trim() === "") return;

    resultados.push({
      nome: data.nome.trim(),
      preco: parseFloat(data.preco) || 0,
      estoque: parseInt(data.stock) || 0,
      imagem: "",
      ativo: 1,
    });
  })
  .on("end", () => {
    console.log("📦 Produtos válidos:", resultados.length);

    resultados.forEach((p) => {
      db.query(
        "INSERT INTO produtos (nome, preco, estoque, imagem, ativo) VALUES (?, ?, ?, ?, ?)",
        [p.nome, p.preco, p.estoque, p.imagem, p.ativo]
      );
    });

    console.log("🔥 IMPORTAÇÃO LIMPA FINALIZADA!");
  });