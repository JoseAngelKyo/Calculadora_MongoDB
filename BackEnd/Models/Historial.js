const mongoose = require('mongoose');

const HistorialSchema = new mongoose.Schema({
    expresion: {
        type: String,
        required: true
    },
    resultado: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Historial', HistorialSchema);