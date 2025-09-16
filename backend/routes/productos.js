// backend/routes/productos.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// Obtener todos los productos
router.get('/', productoController.getAll);

// Crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { nombre, codigo_barras, precio, stock } = req.body;

        if (!nombre || precio == null || stock == null) {
            return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
        }

        const id = await productoController.create({ nombre, codigo_barras, precio, stock });
        res.json({ success: true, id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Actualizar un producto existente por ID
router.put('/:id', async (req, res) => {
    try {
        const { nombre, codigo_barras, precio, stock } = req.body;

        if (!nombre || precio == null || stock == null) {
            return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
        }

        // Aquí suponemos que tu modelo productoController tiene un método update
        if (productoController.update) {
            await productoController.update(req.params.id, { nombre, codigo_barras, precio, stock });
            res.json({ success: true });
        } else {
            res.status(501).json({ success: false, message: "Actualización no implementada" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
