const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// Crear venta y detalle con validación de stock, cálculo de total y transacción
function create(venta, callback) {
    const { cliente_id, productos } = venta;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        let totalVenta = 0;

        // Insertamos la venta con total = 0 (lo actualizaremos luego)
        db.run(
            `INSERT INTO ventas (cliente_id, fecha, total) VALUES (?, datetime('now'), 0)`,
            [cliente_id],
            function (err) {
                if (err) {
                    db.run("ROLLBACK");
                    return callback(err);
                }

                const ventaId = this.lastID;
                let procesados = 0;
                let errorOcurrido = false;

                productos.forEach(p => {
                    if (errorOcurrido) return;

                    db.get(
                        `SELECT stock, precio FROM productos WHERE id = ?`,
                        [p.producto_id],
                        (err, row) => {
                            if (errorOcurrido) return;
                            if (err || !row) {
                                errorOcurrido = true;
                                db.run("ROLLBACK");
                                return callback(err || new Error("Producto no encontrado"));
                            }

                            if (row.stock < p.cantidad) {
                                errorOcurrido = true;
                                db.run("ROLLBACK");
                                return callback(new Error(`Stock insuficiente para producto ID ${p.producto_id}`));
                            }

                            const subtotal = row.precio * p.cantidad;
                            totalVenta += subtotal;

                            db.run(
                                `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)`,
                                [ventaId, p.producto_id, p.cantidad, row.precio],
                                (err) => {
                                    if (err && !errorOcurrido) {
                                        errorOcurrido = true;
                                        db.run("ROLLBACK");
                                        return callback(err);
                                    }
                                }
                            );

                            db.run(
                                `UPDATE productos SET stock = stock - ? WHERE id = ?`,
                                [p.cantidad, p.producto_id],
                                (err) => {
                                    if (err && !errorOcurrido) {
                                        errorOcurrido = true;
                                        db.run("ROLLBACK");
                                        return callback(err);
                                    }

                                    procesados++;
                                    if (procesados === productos.length && !errorOcurrido) {
                                        // Actualizamos el total de la venta
                                        db.run(
                                            `UPDATE ventas SET total = ? WHERE id = ?`,
                                            [totalVenta, ventaId],
                                            (err) => {
                                                if (err) {
                                                    db.run("ROLLBACK");
                                                    return callback(err);
                                                }
                                                db.run("COMMIT");
                                                callback(null, { id: ventaId, total: totalVenta, ...venta });
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    );
                });
            }
        );
    });
}

// Obtener todas las ventas con detalles y nombres de clientes/productos
function getAll(callback) {
    const query = `
    SELECT v.id as venta_id, v.fecha, v.total, 
           c.nombre as cliente_nombre,
           p.nombre as producto_nombre,
           dv.cantidad, dv.precio
    FROM ventas v
    JOIN clientes c ON v.cliente_id = c.id
    LEFT JOIN detalle_ventas dv ON v.id = dv.venta_id
    LEFT JOIN productos p ON dv.producto_id = p.id
    ORDER BY v.id DESC
    `;
    db.all(query, [], (err, rows) => {
        callback(err, rows);
    });
}

module.exports = { create, getAll };
