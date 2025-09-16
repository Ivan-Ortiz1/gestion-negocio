// backend/models/venta.js
const { run, all, get } = require('../db/database');

// Crear una venta con detalle, validación de stock y cálculo de total
async function create(venta) {
    const { clienteId, detalles } = venta;

    if (!clienteId || !Array.isArray(detalles) || detalles.length === 0) {
        throw new Error('clienteId y detalles son obligatorios');
    }

    try {
        // Iniciar transacción
        await run("BEGIN TRANSACTION");

        let totalVenta = 0;

        // Insertar venta con total 0 inicialmente
        const ventaId = await run(
            "INSERT INTO ventas (cliente_id, fecha, total) VALUES (?, datetime('now'), 0)",
            [clienteId]
        );

        for (const item of detalles) {
            const producto = await get(
                "SELECT stock, precio FROM productos WHERE id = ?",
                [item.productoId]
            );

            if (!producto) {
                await run("ROLLBACK");
                throw new Error(`Producto ID ${item.productoId} no encontrado`);
            }

            if (producto.stock < item.cantidad) {
                await run("ROLLBACK");
                throw new Error(`Stock insuficiente para producto ID ${item.productoId}`);
            }

            const subtotal = producto.precio * item.cantidad;
            totalVenta += subtotal;

            // Insertar detalle de venta
            await run(
                "INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)",
                [ventaId, item.productoId, item.cantidad, producto.precio]
            );

            // Actualizar stock del producto
            await run(
                "UPDATE productos SET stock = stock - ? WHERE id = ?",
                [item.cantidad, item.productoId]
            );
        }

        // Actualizar total de la venta
        await run("UPDATE ventas SET total = ? WHERE id = ?", [totalVenta, ventaId]);

        // Commit
        await run("COMMIT");

        return { id: ventaId, total: totalVenta, clienteId, detalles };

    } catch (err) {
        await run("ROLLBACK");
        throw new Error('Error al crear venta: ' + err.message);
    }
}

// Obtener todas las ventas con detalles y nombres de clientes/productos
async function getAll() {
    const query = `
        SELECT v.id as venta_id, v.fecha, v.total, 
               c.nombre as cliente_nombre,
               p.nombre as producto_nombre,
               dv.cantidad, dv.precio
        FROM ventas v
        JOIN clientes c ON v.cliente_id = c.id
        LEFT JOIN detalles_venta dv ON v.id = dv.venta_id
        LEFT JOIN productos p ON dv.producto_id = p.id
        ORDER BY v.id DESC
    `;
    try {
        const rows = await all(query);
        return rows;
    } catch (err) {
        throw new Error('Error al obtener ventas: ' + err.message);
    }
}

module.exports = { create, getAll };
