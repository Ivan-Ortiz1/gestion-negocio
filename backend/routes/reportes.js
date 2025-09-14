const express = require("express");
const router = express.Router();
const db = require("../db/database.js");


// Reporte 1: Ventas por día
router.get("/ventas-dia", (req, res) => {
  const query = `
    SELECT DATE(v.fecha) as fecha, SUM(v.total) as total
    FROM ventas v
    GROUP BY DATE(v.fecha)
    ORDER BY fecha DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Reporte 2: Ventas por cliente
router.get("/ventas-cliente", (req, res) => {
  const query = `
    SELECT c.nombre as cliente, SUM(v.total) as total
    FROM ventas v
    JOIN clientes c ON v.cliente_id = c.id
    GROUP BY c.id
    ORDER BY total DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Reporte 3: Top 10 productos más vendidos
router.get("/productos-mas-vendidos", (req, res) => {
  const query = `
    SELECT p.nombre as producto, SUM(dv.cantidad) as total_vendido
    FROM detalles_venta dv
    JOIN productos p ON dv.producto_id = p.id
    GROUP BY p.id
    ORDER BY total_vendido DESC
    LIMIT 10
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Reporte 4: Producto más vendido (solo el top 1)
router.get("/producto-top", (req, res) => {
  const query = `
    SELECT p.nombre as producto, SUM(dv.cantidad) as total_vendido
    FROM detalles_venta dv
    JOIN productos p ON dv.producto_id = p.id
    GROUP BY p.id
    ORDER BY total_vendido DESC
    LIMIT 1
  `;
  db.get(query, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

module.exports = router;
