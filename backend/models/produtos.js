const mongoose = require("mongoose");

const ProdutoSchema = new mongoose.Schema({
  nome: String,
  preco: Number,
  imagem: String,
  estoque: Number,
  ativo: {
    type: Boolean,
    default: false // começa oculto
  }
});

module.exports = mongoose.model("Produto", ProdutoSchema);