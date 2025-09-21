// backend/models/venta.js
const { run, all, get } = require('../db/database');

/**
 * Crear una venta con detalles
 * Valida stock, calcula total y actualiza inventario
 */
async function create(venta) {
  const { cliente_id, productos } = venta;

  if (!cliente_id || !Array.isArray(productos) || productos.length === 0) {
    throw new Error('cliente_id y productos son obligatorios');
  }

  try {
    // Iniciar transacción
    await run("BEGIN TRANSACTION");

    let totalVenta = 0;

    // Insertar venta con total 0 inicialmente
    const ventaResult = await run(
      "INSERT INTO ventas (cliente_id, fecha, total) VALUES (?, datetime('now'), 0)",
      [cliente_id]
    );
    const ventaId = ventaResult.lastID;

    for (const item of productos) {
      const producto = await get(
        "SELECT stock, precio, nombre FROM productos WHERE id = ?",
        [item.producto_id]
      );

      if (!producto) {
        await run("ROLLBACK");
        throw new Error(`Producto ID ${item.producto_id} no encontrado`);
      }

      if (producto.stock < item.cantidad) {
        await run("ROLLBACK");
        throw new Error(`Stock insuficiente para producto: ${producto.nombre}`);
      }

      const subtotal = producto.precio * item.cantidad;
      totalVenta += subtotal;

      // Insertar detalle de venta
      await run(
        "INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)",
        [ventaId, item.producto_id, item.cantidad, producto.precio]
      );

      // Actualizar stock del producto
      await run(
        "UPDATE productos SET stock = stock - ? WHERE id = ?",
        [item.cantidad, item.producto_id]
      );
    }

    // Actualizar total de la venta
    await run("UPDATE ventas SET total = ? WHERE id = ?", [totalVenta, ventaId]);

    // Commit
    await run("COMMIT");

    return {
      success: true,
      message: "Venta creada correctamente",
      data: { id: ventaId, total: totalVenta, cliente_id, productos }
    };

  } catch (err) {
    await run("ROLLBACK");
    throw new Error('Error al crear venta: ' + err.message);
  }
}

/**
 * Obtener todas las ventas con detalles
 */
async function getAll() {
  const query = `
    SELECT v.id as venta_id, v.fecha, v.total, 
           c.id as cliente_id, c.nombre as cliente_nombre,
           p.id as producto_id, p.nombre as producto_nombre,
           dv.cantidad, dv.precio
    FROM ventas v
    JOIN clientes c ON v.cliente_id = c.id
    LEFT JOIN detalles_venta dv ON v.id = dv.venta_id
    LEFT JOIN productos p ON dv.producto_id = p.id
    ORDER BY v.id DESC
  `;
  try {
    const rows = await all(query);
    return {
      success: true,
      message: "Ventas obtenidas correctamente",
      data: rows
    };
  } catch (err) {
    throw new Error('Error al obtener ventas: ' + err.message);
  }
}

module.exports = { create, getAll };
