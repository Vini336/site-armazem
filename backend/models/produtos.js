const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema({
  codigo: Number,
  nome: String,
  preco: Number,
  imagem: String,
  estoque: Number,
  qmin: Number,

  ativo: {
    type: Boolean,
    default: true // agora já aparece no site
  }
});

module.exports = mongoose.model("Produto", produtoSchema);