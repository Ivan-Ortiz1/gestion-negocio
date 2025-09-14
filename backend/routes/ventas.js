const express = require("express");
const router = express.Router();
const db = require("../db/database"); // archivo que exporta la conexión SQLite

// Registrar nueva venta
router.post("/", (req, res) => {
  const { cliente_id, productos } = req.body;

  if (!cliente_id || !productos || !productos.length) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const fecha = new Date().toISOString();

  // Insertar venta
  db.run(
    `INSERT INTO ventas (cliente_id, fecha, total) VALUES (?, ?, 0)`,
    [cliente_id, fecha],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const ventaId = this.lastID;
      let totalVenta = 0;

      productos.forEach(item => {
        // Obtener precio del producto
        db.get(`SELECT precio, stock FROM productos WHERE id = ?`, [item.producto_id], (err, producto) => {
          if (err) return res.status(500).json({ error: err.message });
          if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
          if (producto.stock < item.cantidad) return res.status(400).json({ error: `Stock insuficiente para ${item.producto_id}` });

          const subtotal = producto.precio * item.cantidad;
          totalVenta += subtotal;

          // Insertar detalle de venta
          db.run(
            `INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)`,
            [ventaId, item.producto_id, item.cantidad, producto.precio]
          );

          // Actualizar stock
          db.run(
            `UPDATE productos SET stock = stock - ? WHERE id = ?`,
            [item.cantidad, item.producto_id]
          );

          // Después de insertar todos los detalles, actualizar el total de la venta
          if (productos.indexOf(item) === productos.length - 1) {
            db.run(
              `UPDATE ventas SET total = ? WHERE id = ?`,
              [totalVenta, ventaId],
              err => {
                if (err) console.error(err);
              }
            );
          }
        });
      });

      res.json({ message: "Venta registrada con éxito", id: ventaId });
    }
  );
});

// Obtener todas las ventas (opcional)
router.get("/", (req, res) => {
  db.all(
    `SELECT v.id, v.fecha, v.total, c.nombre as cliente
     FROM ventas v
     JOIN clientes c ON v.cliente_id = c.id
     ORDER BY v.fecha DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
