const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importamos el modelo (Atención a la 'M' mayúscula de 'Models')
const Historial = require('./Models/Historial');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🟢 Conectado exitosamente a MongoDB Atlas'))
    .catch((error) => console.error('🔴 DETALLE DEL ERROR:', error.message));
// --- RUTAS API ---

// 1. Obtener los últimos 10 cálculos
app.get('/api/historial', async (req, res) => {
    try {
        const registros = await Historial.find().sort({ fecha: -1 }).limit(10);
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el historial' });
    }
});

// 2. Guardar un nuevo cálculo
app.post('/api/historial', async (req, res) => {
    try {
        const { expresion, resultado } = req.body;
        if (!expresion || !resultado) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }
        const nuevoRegistro = new Historial({ expresion, resultado });
        await nuevoRegistro.save();
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar la operación' });
    }
});

// 3. Borrar el historial completo
app.delete('/api/historial', async (req, res) => {
    try {
        await Historial.deleteMany({});
        res.json({ mensaje: 'Historial eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el historial' });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
// Endpoint para verificar si MongoDB está conectado
app.get('/api/estado', (req, res) => {
    // mongoose.connection.readyState === 1 significa 'Conectado'
    const estaConectado = mongoose.connection.readyState === 1;
    res.json({ conectado: estaConectado });
});