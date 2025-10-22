const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comentario = Schema({
    titulo: { type: String, required: true },
    texto: { type: String, required: true },
    autor: { type: String, required: true }
});
module.exports = mongoose.model("Comentario", Comentario)