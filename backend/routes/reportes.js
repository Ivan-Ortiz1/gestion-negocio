// backend/routes/reportes.js
const express = require("express");
const router = express.Router();
const { all, get } = require("../db/database");

// Reporte 1: Ventas por día
router.get("/ventas-dia", async (req, res) => {
    const query = `
        SELECT DATE(v.fecha) as fecha, SUM(v.total) as total
        FROM ventas v
        GROUP BY DATE(v.fecha)
        ORDER BY fecha DESC
    `;
    try {
        const rows = await all(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reporte 2: Ventas por cliente
router.get("/ventas-cliente", async (req, res) => {
    const query = `
        SELECT c.nombre as cliente, SUM(v.total) as total
        FROM ventas v
        JOIN clientes c ON v.cliente_id = c.id
        GROUP BY c.id
        ORDER BY total DESC
    `;
    try {
        const rows = await all(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reporte 3: Top 10 productos más vendidos
router.get("/productos-mas-vendidos", async (req, res) => {
    const query = `
        SELECT p.nombre as producto, SUM(dv.cantidad) as total_vendido
        FROM detalles_venta dv
        JOIN productos p ON dv.producto_id = p.id
        GROUP BY p.id
        ORDER BY total_vendido DESC
        LIMIT 10
    `;
    try {
        const rows = await all(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reporte 4: Producto más vendido (solo el top 1)
router.get("/producto-top", async (req, res) => {
    const query = `
        SELECT p.nombre as producto, SUM(dv.cantidad) as total_vendido
        FROM detalles_venta dv
        JOIN productos p ON dv.producto_id = p.id
        GROUP BY p.id
        ORDER BY total_vendido DESC
        LIMIT 1
    `;
    try {
        const row = await get(query);
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
