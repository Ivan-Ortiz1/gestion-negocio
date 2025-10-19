// backend/controllers/reporteController.js
const Reporte = require('../models/reporte');

async function getVentasPorPeriodo(req, res) {
    try {
        const { inicio, fin } = req.query;
        if (!inicio || !fin) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar fechas de inicio y fin',
                data: null
            });
        }

        const ventas = await Reporte.getVentasPorPeriodo(inicio, fin);
        res.json({
            success: true,
            message: 'Reporte de ventas generado correctamente',
            data: ventas
        });
    } catch (err) {
        console.error('Error al generar reporte de ventas:', err);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de ventas',
            data: null
        });
    }
}

async function getProductosMasVendidos(req, res) {
    try {
        const { inicio, fin, limite } = req.query;
        if (!inicio || !fin) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar fechas de inicio y fin',
                data: null
            });
        }

        const productos = await Reporte.getProductosMasVendidos(
            inicio, 
            fin, 
            limite ? parseInt(limite) : 10
        );
        
        res.json({
            success: true,
            message: 'Reporte de productos más vendidos generado correctamente',
            data: productos
        });
    } catch (err) {
        console.error('Error al generar reporte de productos más vendidos:', err);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de productos más vendidos',
            data: null
        });
    }
}

async function getEstadoInventario(req, res) {
    try {
        const { stockMinimo } = req.query;
        const inventario = await Reporte.getEstadoInventario(
            stockMinimo ? parseInt(stockMinimo) : null
        );
        
        res.json({
            success: true,
            message: 'Reporte de inventario generado correctamente',
            data: inventario
        });
    } catch (err) {
        console.error('Error al generar reporte de inventario:', err);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de inventario',
            data: null
        });
    }
}

module.exports = {
    getVentasPorPeriodo,
    getProductosMasVendidos,
    getEstadoInventario
};