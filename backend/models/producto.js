// backend/models/producto.js
const { run, all, get } = require("../db/database");

/**
 * Obtener todos los productos
 */
async function getAll() {
  try {
    const productos = await all("SELECT * FROM productos");
    return productos;
  } catch (err) {
    throw new Error("Error al obtener productos: " + err.message);
  }
}

/**
 * Obtener un producto por ID
 */
async function getById(id) {
  try {
    const producto = await get("SELECT * FROM productos WHERE id = ?", [id]);
    return producto;
  } catch (err) {
    throw new Error("Error al obtener producto: " + err.message);
  }
}

/**
 * Crear un producto
 */
async function create(producto) {
  try {
    const { nombre, codigo_barras, precio, stock } = producto;

    const result = await run(
      "INSERT INTO productos (nombre, codigo_barras, precio, stock) VALUES (?, ?, ?, ?)",
      [nombre, codigo_barras || null, precio, stock || 0]
    );

    return result.lastID; // Devuelve el ID insertado
  } catch (err) {
    throw new Error("Error al crear producto: " + err.message);
  }
}

/**
 * Actualizar un producto por ID
 */
async function update(id, producto) {
  try {
    const { nombre, codigo_barras, precio, stock } = producto;

    const result = await run(
      "UPDATE productos SET nombre = ?, codigo_barras = ?, precio = ?, stock = ? WHERE id = ?",
      [nombre, codigo_barras || null, precio, stock || 0, id]
    );

    return result.changes > 0; // Devuelve true si se actualizó algo
  } catch (err) {
    throw new Error("Error al actualizar producto: " + err.message);
  }
}

/**
 * Eliminar un producto por ID
 */
async function remove(id) {
  try {
    const result = await run("DELETE FROM productos WHERE id = ?", [id]);
    return result.changes > 0; // Devuelve true si se eliminó algo
  } catch (err) {
    throw new Error("Error al eliminar producto: " + err.message);
  }
}

module.exports = { getAll, getById, create, update, remove };
