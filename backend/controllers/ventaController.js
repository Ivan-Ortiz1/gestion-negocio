const Venta = require('../models/venta');

// Obtener todas las ventas
async function getAll(req, res) {
    try {
        const ventas = await Venta.getAll();
        res.json(ventas);
    } catch (err) {
        console.error('Error al obtener ventas:', err);
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
}

// Crear una nueva venta
async function create(req, res) {
    try {
        const { clienteId, total, detalles } = req.body;

        // Validación básica
        if (!clienteId || total == null || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ error: 'clienteId, total y detalles son obligatorios' });
        }

        const id = await Venta.create({ clienteId, total, detalles });
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error al crear venta:', err);
        res.status(500).json({ error: 'Error al crear venta' });
    }
}

module.exports = { getAll, create };
