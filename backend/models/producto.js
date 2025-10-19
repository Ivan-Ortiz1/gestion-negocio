// backend/models/producto.js
const { run, all, get } = require("../db/database");

/**
 * Obtener productos con paginación
 * @param {number} page - Número de página
 * @param {number} limit - Cantidad de items por página
 * @param {string} search - Término de búsqueda opcional
 */
async function getAll(page = 1, limit = 10, search = '') {
  try {
    const offset = (page - 1) * limit;
    
    // Consulta para obtener el total de registros
    const countQuery = search 
      ? "SELECT COUNT(*) as total FROM productos WHERE nombre LIKE ? OR codigo_barras LIKE ?"
      : "SELECT COUNT(*) as total FROM productos";
    
    const countParams = search 
      ? [`%${search}%`, `%${search}%`]
      : [];
    
    const totalCount = await get(countQuery, countParams);
    
    // Consulta para obtener los productos paginados
    const query = search
      ? `SELECT * FROM productos WHERE nombre LIKE ? OR codigo_barras LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?`
      : `SELECT * FROM productos ORDER BY id DESC LIMIT ? OFFSET ?`;
    
    const queryParams = search
      ? [`%${search}%`, `%${search}%`, limit, offset]
      : [limit, offset];
    
    const productos = await all(query, queryParams);
    
    return {
      items: productos,
      total: totalCount.total,
      page: page,
      totalPages: Math.ceil(totalCount.total / limit)
    };
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
