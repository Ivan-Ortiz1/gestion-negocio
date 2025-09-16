// backend/models/producto.js
const { run, all } = require('../db/database');

// Obtener todos los productos
async function getAll() {
    try {
        const productos = await all("SELECT * FROM productos");
        return productos;
    } catch (err) {
        throw new Error('Error al obtener productos: ' + err.message);
    }
}

// Crear un producto
async function create(producto) {
    try {
        const { nombre, codigo_barras, precio, stock } = producto;

        const id = await run(
            "INSERT INTO productos (nombre, codigo_barras, precio, stock) VALUES (?, ?, ?, ?)",
            [nombre, codigo_barras, precio, stock]
        );
        return id;
    } catch (err) {
        throw new Error('Error al crear producto: ' + err.message);
    }
}

module.exports = { getAll, create };
