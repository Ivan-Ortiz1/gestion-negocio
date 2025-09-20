// backend/controllers/productoController.js
const Producto = require("../models/producto");

// Obtener todos los productos
async function getAll(req, res) {
  try {
    const productos = await Producto.getAll();
    res.json({
      success: true,
      message: "Productos obtenidos correctamente",
      data: productos
    });
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
      data: null
    });
  }
}

// Crear un nuevo producto
async function create(req, res) {
  try {
    const { nombre, precio, stock } = req.body;

    const id = await Producto.create({ nombre, precio, stock });
    res.status(201).json({
      success: true,
      message: "Producto creado correctamente",
      data: { id }
    });
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(500).json({
      success: false,
      message: "Error al crear producto",
      data: null
    });
  }
}

// Actualizar producto
async function update(req, res) {
  try {
    const id = req.params.id;
    const { nombre, codigo_barras, precio, stock } = req.body;

    const actualizado = await Producto.update(id, {
      nombre,
      codigo_barras,
      precio,
      stock
    });

    if (!actualizado) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
        data: null
      });
    }

    res.json({
      success: true,
      message: "Producto actualizado correctamente",
      data: { id }
    });
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({
      success: false,
      message: "Error al actualizar producto",
      data: null
    });
  }
}

// Eliminar producto
async function remove(req, res) {
  try {
    const id = req.params.id;
    const eliminado = await Producto.remove(id);

    if (!eliminado) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
        data: null
      });
    }

    res.json({
      success: true,
      message: "Producto eliminado correctamente",
      data: { id }
    });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto",
      data: null
    });
  }
}

module.exports = { getAll, create, update, remove };
