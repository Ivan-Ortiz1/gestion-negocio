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

        if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }
        if (precio == null || isNaN(precio) || precio < 0) {
            return res.status(400).json({ error: "El precio debe ser un número positivo" });
        }
        if (stock == null || isNaN(stock) || stock < 0) {
            return res.status(400).json({ error: "El stock debe ser un número positivo" });
        }

        const id = await Producto.create({ nombre, precio, stock });
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error al crear producto:', err);
        res.status(500).json({ error: 'Error al crear producto' });
    }
}

// Actualizar producto
async function update(req, res) {
    try {
        const { nombre, codigo_barras, precio, stock } = req.body;
        const id = req.params.id;

        if (!nombre || precio == null || stock == null) {
            return res.status(400).json({ error: 'Nombre, precio y stock son obligatorios' });
        }

        await Producto.update(id, { nombre, codigo_barras, precio, stock });
        res.json({ success: true });
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
}

// Eliminar producto
async function remove(req, res) {
    try {
        const id = req.params.id;
        await Producto.remove(id);
        res.json({ success: true });
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
}

module.exports = { getAll, create, update, remove };
