// backend/controllers/ventaController.js
const Venta = require('../models/venta');

// Obtener todas las ventas
async function getAll(req, res) {
    try {
        const ventas = await Venta.getAll();
        res.json({
            success: true,
            message: "Ventas obtenidas correctamente",
            data: ventas.data
        });
    } catch (err) {
        console.error('Error al obtener ventas:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener ventas',
            data: null
        });
    }
}

// Crear una nueva venta
async function create(req, res) {
    try {
        const { cliente_id, productos } = req.body;

        // Validaciones
        if (!cliente_id || !Number.isInteger(cliente_id) || cliente_id < 1) {
            return res.status(400).json({
                success: false,
                message: "Cliente inválido",
                data: null
            });
        }
        if (!Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Debe enviar al menos un producto",
                data: null
            });
        }

        for (const item of productos) {
            if (!item.producto_id || !Number.isInteger(item.producto_id) || item.producto_id < 1) {
                return res.status(400).json({
                    success: false,
                    message: `Producto inválido en la lista`,
                    data: null
                });
            }
            if (!item.cantidad || !Number.isInteger(item.cantidad) || item.cantidad < 1) {
                return res.status(400).json({
                    success: false,
                    message: `Cantidad inválida para el producto ID ${item.producto_id}`,
                    data: null
                });
            }
        }

        const result = await Venta.create({ cliente_id, productos });
        res.status(201).json(result);

    } catch (err) {
        console.error('Error al crear venta:', err);
        res.status(500).json({
            success: false,
            message: 'Error al crear venta',
            data: null
        });
    }
}

module.exports = { getAll, create };
