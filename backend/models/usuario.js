const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  telefone: String,
  senha: String,
  tipo: {
  type: String,
  default: "cliente"
}
});

module.exports = mongoose.model("Usuario", UsuarioSchema);