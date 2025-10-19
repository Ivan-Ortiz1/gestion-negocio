// backend/controllers/productoController.js
const Producto = require("../models/producto");
const { 
    isPrecioValido, 
    isCodigoBarrasValido, 
    isNombreValido, 
    isStockValido,
    formatSQLiteError 
} = require("../utils/validations");
const { logOperacion } = require("../utils/logger");

// Obtener productos con paginación
async function getAll(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        if (page < 1 || isNaN(page)) {
            return res.status(400).json({
                success: false,
                message: "El número de página debe ser un número positivo",
                data: null
            });
        }

        if (limit < 1 || isNaN(limit)) {
            return res.status(400).json({
                success: false,
                message: "El límite debe ser un número positivo",
                data: null
            });
        }

        const resultado = await Producto.getAll(page, limit, search);
        
        res.json({
            success: true,
            message: "Productos obtenidos correctamente",
            data: resultado.items,
            pagination: {
                total: resultado.total,
                page: resultado.page,
                totalPages: resultado.totalPages
            }
        });
    } catch (err) {
        console.error("Error al obtener productos:", err);
        res.status(500).json({
            success: false,
            message: "Error al obtener productos",
            error: err.message
        });
    }
}

// Crear un nuevo producto
async function create(req, res) {
    try {
        const { nombre, precio, stock, codigo_barras } = req.body;
        const errors = [];

        // Validaciones
        if (!isNombreValido(nombre)) {
            errors.push("El nombre debe tener entre 3 y 100 caracteres");
        }
        if (!isPrecioValido(precio)) {
            errors.push("El precio debe ser un número positivo con máximo 2 decimales");
        }
        if (!isStockValido(stock)) {
            errors.push("El stock debe ser un número entero positivo o cero");
        }
        if (codigo_barras && !isCodigoBarrasValido(codigo_barras)) {
            errors.push("El código de barras debe tener entre 8 y 13 dígitos numéricos");
        }
        if (errors.length > 0) {
            logOperacion('PRODUCTO_CREACION_FALLIDA', 'Intento fallido de crear producto', { nombre, precio, stock, codigo_barras, errors });
            return res.status(400).json({
                success: false,
                message: "Datos de producto inválidos",
                errors
            });
        }

        const id = await Producto.create({
            nombre: nombre.trim(),
            precio: parseFloat(precio),
            stock: parseInt(stock || 0),
            codigo_barras
        });

        logOperacion('PRODUCTO_CREADO', 'Producto creado correctamente', { id, nombre, precio, stock, codigo_barras });
        res.status(201).json({
            success: true,
            message: "Producto creado correctamente",
            data: {
                id,
                nombre: nombre.trim(),
                precio: parseFloat(precio),
                stock: parseInt(stock || 0),
                codigo_barras
            }
        });
    } catch (err) {
        logOperacion('PRODUCTO_CREACION_ERROR', 'Error al crear producto', { error: err.message });
        console.error("Error al crear producto:", err);
        res.status(500).json({
            success: false,
            message: formatSQLiteError(err),
            error: err.message
        });
    }
}

// Actualizar producto
async function update(req, res) {
    try {
        const id = req.params.id;
        const { nombre, precio, stock, codigo_barras } = req.body;
        const errors = [];

        // Validaciones
        if (!isNombreValido(nombre)) {
            errors.push("El nombre debe tener entre 3 y 100 caracteres");
        }
        if (!isPrecioValido(precio)) {
            errors.push("El precio debe ser un número positivo con máximo 2 decimales");
        }
        if (!isStockValido(stock)) {
            errors.push("El stock debe ser un número entero positivo o cero");
        }
        if (codigo_barras && !isCodigoBarrasValido(codigo_barras)) {
            errors.push("El código de barras debe tener entre 8 y 13 dígitos numéricos");
        }
        if (errors.length > 0) {
            logOperacion('PRODUCTO_ACTUALIZACION_FALLIDA', 'Intento fallido de actualizar producto', { id, nombre, precio, stock, codigo_barras, errors });
            return res.status(400).json({
                success: false,
                message: "Datos de producto inválidos",
                errors
            });
        }

        const actualizado = await Producto.update(id, {
            nombre: nombre.trim(),
            precio: parseFloat(precio),
            stock: parseInt(stock || 0),
            codigo_barras
        });

        if (!actualizado) {
            logOperacion('PRODUCTO_NO_ENCONTRADO', 'Intento de actualizar producto no existente', { id });
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado",
                data: null
            });
        }

        logOperacion('PRODUCTO_ACTUALIZADO', 'Producto actualizado correctamente', { id, nombre, precio, stock, codigo_barras });
        res.json({
            success: true,
            message: "Producto actualizado correctamente",
            data: {
                id,
                nombre: nombre.trim(),
                precio: parseFloat(precio),
                stock: parseInt(stock || 0),
                codigo_barras
            }
        });
    } catch (err) {
        logOperacion('PRODUCTO_ACTUALIZACION_ERROR', 'Error al actualizar producto', { id, error: err.message });
        console.error("Error al actualizar producto:", err);
        res.status(500).json({
            success: false,
            message: formatSQLiteError(err),
            error: err.message
        });
    }
}

// Eliminar producto
async function remove(req, res) {
    try {
        const id = req.params.id;

        // Validar que el id sea un número
        if (!id || isNaN(id)) {
            logOperacion('PRODUCTO_ELIMINACION_FALLIDA', 'Intento fallido de eliminar producto (ID inválido)', { id });
            return res.status(400).json({
                success: false,
                message: "ID de producto inválido",
                data: null
            });
        }

        const eliminado = await Producto.remove(id);

        if (!eliminado) {
            logOperacion('PRODUCTO_NO_ENCONTRADO', 'Intento de eliminar producto no existente', { id });
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado",
                data: null
            });
        }

        logOperacion('PRODUCTO_ELIMINADO', 'Producto eliminado correctamente', { id });
        res.json({
            success: true,
            message: "Producto eliminado correctamente",
            data: { id }
        });
    } catch (err) {
        logOperacion('PRODUCTO_ELIMINACION_ERROR', 'Error al eliminar producto', { id, error: err.message });
        console.error("Error al eliminar producto:", err);
        res.status(500).json({
            success: false,
            message: formatSQLiteError(err),
            error: err.message
        });
    }
}

module.exports = { getAll, create, update, remove };
