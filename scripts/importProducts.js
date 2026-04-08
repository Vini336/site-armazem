const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Product = require('../backend/models/produtos'); // seu model

require('../backend/database/db');

async function importProducts() {
  const file = xlsx.readFile('data/produtos loja.xlsx');
  const sheet = file.Sheets[file.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const products = data.map(item => ({
    code: item.CODIGO,
    nome: item.NOME,
    stock: item.QUANT,
    minStock: item.QMIN,
    preco: 0
  }));

  await Product.insertMany(products);

  console.log('✅ Produtos importados com sucesso!');
  mongoose.disconnect();
}

importProducts();