const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mysql = require("mysql2");

// 🔌 conexão com seu banco
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "vini3368",
  database: "armazem",
  port: 3307
});

// 📄 caminho do CSV
const caminhoCSV = path.join(__dirname, "data", "produtos.csv");

// 🧠 função pra tratar números (resolve vírgula e negativos tipo (4,00))
function tratarNumero(valor) {
  if (!valor) return 0;

  let v = valor.toString().trim();

  if (v.startsWith("(") && v.endsWith(")")) {
    v = "-" + v.slice(1, -1);
  }

  v = v.replace(",", ".");
  return parseFloat(v) || 0;
}

const produtos = [];

// 📥 leitura do CSV
fs.createReadStream(caminhoCSV)
  .pipe(csv({ separator: ";" }))
  .on("data", (linha) => {
    produtos.push([
      linha.nome || linha.NOME || "Produto",
      tratarNumero(linha.preco || linha.PRECO),
      tratarNumero(linha.stock || linha.estoque || linha.STOCK),
      "", // imagem (deixa vazio por enquanto)
      0   // ativo (deixa oculto por enquanto)
    ]);
  })
  .on("end", () => {
    console.log("📦 Produtos lidos:", produtos.length);

    const sql = `
      INSERT INTO produtos (nome, preco, estoque, imagem, ativo)
      VALUES ?
    `;

    db.query(sql, [produtos], (err) => {
      if (err) {
        console.error("❌ Erro ao inserir:", err);
      } else {
        console.log("🔥 IMPORTAÇÃO FINALIZADA COM SUCESSO!");
      }
      db.end();
    });
  });