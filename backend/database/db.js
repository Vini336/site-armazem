const mongoose = require("mongoose");

mongoose.connect("mongodb://viniciusbarbosa3368_db_user:h8jPlUteqoAiym19@ac-hnmrajh-shard-00-00.smu7evs.mongodb.net:27017,ac-hnmrajh-shard-00-01.smu7evs.mongodb.net:27017,ac-hnmrajh-shard-00-02.smu7evs.mongodb.net:27017/?ssl=true&replicaSet=atlas-44sjen-shard-0&authSource=admin&appName=Cluster0")
.then(() => console.log("Banco conectado 🔥"))
.catch(err => console.log(err));

module.exports = mongoose;