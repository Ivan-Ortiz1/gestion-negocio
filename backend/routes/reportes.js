// backend/routes/reportes.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const reporteController = require('../controllers/reporteController');

const router = express.Router();

// Middleware de validación
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }
    next();
};

/**
 * @route   GET /api/reportes/ventas
 * @desc    Obtener reporte de ventas por período
 */
router.get('/ventas', [
    check('inicio').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Formato de fecha inicio inválido (YYYY-MM-DD)'),
    check('fin').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Formato de fecha fin inválido (YYYY-MM-DD)')
], validate, reporteController.getVentasPorPeriodo);

/**
 * @route   GET /api/reportes/productos-mas-vendidos
 * @desc    Obtener productos más vendidos en un período
 */
router.get('/productos-mas-vendidos', [
    check('inicio').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Formato de fecha inicio inválido (YYYY-MM-DD)'),
    check('fin').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Formato de fecha fin inválido (YYYY-MM-DD)'),
    check('limite').optional().isInt({ min: 1 }).withMessage('Límite debe ser un número entero positivo')
], validate, reporteController.getProductosMasVendidos);

/**
 * @route   GET /api/reportes/inventario
 * @desc    Obtener estado actual del inventario
 */
router.get('/inventario', [
    check('stockMinimo').optional().isInt({ min: 0 }).withMessage('Stock mínimo debe ser un número entero positivo')
], validate, reporteController.getEstadoInventario);

module.exports = router;