const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema({
  nome: String,
  preco: Number,
  imagem: String,
  estoque: Number,

  ativo: {
    type: Boolean,
    default: false // 🔥 começa oculto por padrão
  }
});

module.exports = mongoose.model("Produto", produtoSchema);