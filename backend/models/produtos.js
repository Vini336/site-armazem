const mongoose = require("mongoose");

const ProdutoSchema = new mongoose.Schema({
  code: Number, // novo (codigo da planilha)

  nome: String,

  preco: {
    type: Number,
    default: 0
  },

  imagem: String,

  promocao: {
    type: Boolean,
    default: false
  },

  stock: Number, // novo (quantidade)

  minStock: Number // novo (estoque minimo)
});

module.exports = mongoose.model("Produto", ProdutoSchema);