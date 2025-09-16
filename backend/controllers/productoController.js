const Producto = require('../models/producto');

// Obtener todos los productos
async function getAll(req, res) {
    try {
        const productos = await Producto.getAll();
        res.json(productos);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
}

// Crear un nuevo producto
async function create(req, res) {
    try {
        const { nombre, precio, stock } = req.body;

        // Validación básica
        if (!nombre || precio == null || stock == null) {
            return res.status(400).json({ error: 'Nombre, precio y stock son obligatorios' });
        }

        const id = await Producto.create({ nombre, precio, stock });
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error al crear producto:', err);
        res.status(500).json({ error: 'Error al crear producto' });
    }
}

module.exports = { getAll, create };
