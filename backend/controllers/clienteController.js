const Cliente = require('../models/cliente');

// Obtener todos los clientes
async function getAll(req, res) {
    try {
        const clientes = await Cliente.getAll();
        res.json(clientes);
    } catch (err) {
        console.error('Error al obtener clientes:', err);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
}

// Crear un nuevo cliente
async function create(req, res) {
    try {
        const { nombre, email, telefono } = req.body;

        // Validación básica
        if (!nombre || !email) {
            return res.status(400).json({ error: 'Nombre y email son obligatorios' });
        }

        const id = await Cliente.create({ nombre, email, telefono });
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error al crear cliente:', err);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
}

module.exports = { getAll, create };
