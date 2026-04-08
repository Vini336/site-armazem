const mongoose = require("mongoose");

const PedidoSchema = new mongoose.Schema({
  nome: String,
  telefone: String,
  endereco: String,
  itens: Array,
  total: Number,
  usuarioId: String,
  status: {
    type: String,
    default: "pendente"
},

statusPagamento: {
  type: String,
  default: "pendente"
},
  data: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Pedido", PedidoSchema);