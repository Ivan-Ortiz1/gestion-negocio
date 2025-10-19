// backend/controllers/ventaController.js
const Venta = require('../models/venta');
const { validateProductosVenta, formatSQLiteError } = require('../utils/validations');
const { logOperacion } = require('../utils/logger');

// Obtener ventas con paginación
async function getAll(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const fechaInicio = req.query.fechaInicio || null;
        const fechaFin = req.query.fechaFin || null;

        // Validar parámetros
        if (page < 1 || isNaN(page)) {
            return res.status(400).json({
                success: false,
                message: "El número de página debe ser un número positivo",
                data: null
            });
        }

        if (limit < 1 || isNaN(limit)) {
            return res.status(400).json({
                success: false,
                message: "El límite debe ser un número positivo",
                data: null
            });
        }

        // Validar fechas
        if (fechaInicio && isNaN(Date.parse(fechaInicio))) {
            return res.status(400).json({
                success: false,
                message: "Fecha de inicio inválida",
                data: null
            });
        }

        if (fechaFin && isNaN(Date.parse(fechaFin))) {
            return res.status(400).json({
                success: false,
                message: "Fecha de fin inválida",
                data: null
            });
        }

        const resultado = await Venta.getAll(page, limit, fechaInicio, fechaFin);
        
        res.json({
            success: true,
            message: "Ventas obtenidas correctamente",
            data: resultado.items,
            pagination: {
                total: resultado.total,
                page: resultado.page,
                totalPages: resultado.totalPages
            }
        });
    } catch (err) {
        console.error('Error al obtener ventas:', err);
        res.status(500).json({
            success: false,
            message: formatSQLiteError(err),
            error: err.message
        });
    }
}

// Crear una nueva venta
async function create(req, res) {
    try {
        const { productos } = req.body;

        // Validar productos
        const validacion = validateProductosVenta(productos);
        if (!validacion.isValid) {
            logOperacion('VENTA_CREACION_FALLIDA', 'Intento fallido de crear venta', { productos, errors: validacion.errors });
            return res.status(400).json({
                success: false,
                message: "Datos de venta inválidos",
                errors: validacion.errors
            });
        }

        // Crear la venta con los datos validados
        const result = await Venta.create({ productos: validacion.data });

        logOperacion('VENTA_CREADA', 'Venta creada exitosamente', { productos: validacion.data, venta: result });
        res.status(201).json({
            success: true,
            message: "Venta creada exitosamente",
            data: result
        });

    } catch (err) {
        logOperacion('VENTA_CREACION_ERROR', 'Error al crear venta', { error: err.message });
        console.error('Error al crear venta:', err);

        // Si el error es por stock insuficiente
        if (err.message.includes('stock insuficiente')) {
            logOperacion('VENTA_STOCK_INSUFICIENTE', 'Stock insuficiente al crear venta', { error: err.message });
            return res.status(400).json({
                success: false,
                message: err.message,
                error: 'INSUFFICIENT_STOCK'
            });
        }

        res.status(500).json({
            success: false,
            message: formatSQLiteError(err),
            error: err.message
        });
    }
}

module.exports = { getAll, create };
