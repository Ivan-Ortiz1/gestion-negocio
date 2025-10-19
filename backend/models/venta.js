// backend/models/venta.js
const { run, all, get } = require('../db/database');

/**
 * Crear una venta con detalles
 * Valida stock, calcula total y actualiza inventario
 * Ahora SIN cliente_id
 */
async function create(venta) {
  const { productos } = venta;

  if (!Array.isArray(productos) || productos.length === 0) {
    throw new Error('productos es obligatorio y debe ser un arreglo');
  }

  try {
    await run("BEGIN TRANSACTION");

    let totalVenta = 0;

    // Insertar venta con total 0 inicialmente (sin cliente)
    const ventaResult = await run(
      "INSERT INTO ventas (fecha, total) VALUES (datetime('now'), 0)",
      []
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

      await run(
        "INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)",
        [ventaId, item.producto_id, item.cantidad, producto.precio]
      );

      await run(
        "UPDATE productos SET stock = stock - ? WHERE id = ?",
        [item.cantidad, item.producto_id]
      );
    }

    await run("UPDATE ventas SET total = ? WHERE id = ?", [totalVenta, ventaId]);
    await run("COMMIT");

    return {
      success: true,
      message: "Venta creada correctamente",
      data: { id: ventaId, total: totalVenta, productos }
    };

  } catch (err) {
    await run("ROLLBACK");
    throw new Error('Error al crear venta: ' + err.message);
  }
}

/**
 * Obtener ventas con paginación y detalles
 * @param {number} page - Número de página
 * @param {number} limit - Cantidad de items por página
 * @param {string} fechaInicio - Fecha inicio opcional (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha fin opcional (YYYY-MM-DD)
 */
async function getAll(page = 1, limit = 10, fechaInicio = null, fechaFin = null) {
  // Primero obtenemos el total de ventas
  let countQuery = "SELECT COUNT(DISTINCT v.id) as total FROM ventas v";
  let countParams = [];
  
  if (fechaInicio && fechaFin) {
    countQuery += " WHERE DATE(v.fecha) BETWEEN ? AND ?";
    countParams = [fechaInicio, fechaFin];
  }
  
  const totalCount = await get(countQuery, countParams);
  const offset = (page - 1) * limit;

  // Luego obtenemos las ventas paginadas con sus detalles
  let query = `
    SELECT v.id as venta_id, v.fecha, v.total,
           p.id as producto_id, p.nombre as producto_nombre,
           dv.cantidad, dv.precio
    FROM ventas v
    LEFT JOIN detalles_venta dv ON v.id = dv.venta_id
    LEFT JOIN productos p ON dv.producto_id = p.id
  `;
  if (fechaInicio && fechaFin) {
    query += " WHERE DATE(v.fecha) BETWEEN ? AND ?";
  }
  
  query += ` ORDER BY v.id DESC LIMIT ? OFFSET ?`;

  try {
    const queryParams = fechaInicio && fechaFin
      ? [fechaInicio, fechaFin, limit, offset]
      : [limit, offset];

    const rows = await all(query, queryParams);
    
    // Agrupar los resultados por venta
    const ventasMap = new Map();
    rows.forEach(row => {
      if (!ventasMap.has(row.venta_id)) {
        ventasMap.set(row.venta_id, {
          id: row.venta_id,
          fecha: row.fecha,
          total: row.total,
          detalles: []
        });
      }
      if (row.producto_id) {
        ventasMap.get(row.venta_id).detalles.push({
          producto_id: row.producto_id,
          producto_nombre: row.producto_nombre,
          cantidad: row.cantidad,
          precio: row.precio
        });
      }
    });

    return {
      items: Array.from(ventasMap.values()),
      total: totalCount.total,
      page: page,
      totalPages: Math.ceil(totalCount.total / limit)
    };
  } catch (err) {
    throw new Error('Error al obtener ventas: ' + err.message);
  }
}

module.exports = { create, getAll };
