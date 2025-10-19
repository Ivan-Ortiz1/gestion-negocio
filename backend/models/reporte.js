// backend/models/reporte.js
const { all } = require("../db/database");

/**
 * Obtener reporte de ventas por período
 * @param {string} inicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} fin - Fecha fin (YYYY-MM-DD)
 */
async function getVentasPorPeriodo(inicio, fin) {
    const query = `
        SELECT 
            DATE(fecha) as fecha,
            COUNT(*) as total_ventas,
            SUM(total) as total_ingresos
        FROM ventas
        WHERE DATE(fecha) BETWEEN ? AND ?
        GROUP BY DATE(fecha)
        ORDER BY fecha DESC
    `;
    try {
        return await all(query, [inicio, fin]);
    } catch (err) {
        throw new Error('Error al obtener reporte de ventas: ' + err.message);
    }
}

/**
 * Obtener productos más vendidos
 * @param {string} inicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} fin - Fecha fin (YYYY-MM-DD)
 * @param {number} limite - Límite de resultados
 */
async function getProductosMasVendidos(inicio, fin, limite = 10) {
    const query = `
        SELECT 
            p.id,
            p.nombre,
            SUM(dv.cantidad) as total_vendido,
            SUM(dv.cantidad * dv.precio) as total_ingresos
        FROM productos p
        JOIN detalles_venta dv ON p.id = dv.producto_id
        JOIN ventas v ON dv.venta_id = v.id
        WHERE DATE(v.fecha) BETWEEN ? AND ?
        GROUP BY p.id, p.nombre
        ORDER BY total_vendido DESC
        LIMIT ?
    `;
    try {
        return await all(query, [inicio, fin, limite]);
    } catch (err) {
        throw new Error('Error al obtener productos más vendidos: ' + err.message);
    }
}

/**
 * Obtener estado actual del inventario
 * @param {number} stockMinimo - Filtrar productos con stock menor a este valor
 */
async function getEstadoInventario(stockMinimo = null) {
    let query = `
        SELECT 
            p.id,
            p.nombre,
            p.stock,
            p.precio,
            (SELECT SUM(dv.cantidad) 
             FROM detalles_venta dv 
             JOIN ventas v ON dv.venta_id = v.id 
             WHERE dv.producto_id = p.id) as total_vendido
        FROM productos p
    `;
    
    if (stockMinimo !== null) {
        query += ' WHERE p.stock <= ?';
        try {
            return await all(query, [stockMinimo]);
        } catch (err) {
            throw new Error('Error al obtener estado del inventario: ' + err.message);
        }
    }
    
    try {
        return await all(query);
    } catch (err) {
        throw new Error('Error al obtener estado del inventario: ' + err.message);
    }
}

module.exports = {
    getVentasPorPeriodo,
    getProductosMasVendidos,
    getEstadoInventario
};