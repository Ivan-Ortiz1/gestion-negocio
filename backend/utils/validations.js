// backend/utils/validations.js

/**
 * Validar formato de precio
 * @param {number|string} precio 
 * @returns {boolean}
 */
const isPrecioValido = (precio) => {
    if (precio === null || precio === undefined) return false;
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum < 0) return false;
    // Verificar que tenga máximo 2 decimales
    const decimales = precioNum.toString().split('.')[1];
    return !decimales || decimales.length <= 2;
};

/**
 * Validar formato de código de barras
 * @param {string} codigo 
 * @returns {boolean}
 */
const isCodigoBarrasValido = (codigo) => {
    if (!codigo) return true; // Es opcional
    return /^[0-9]{8,13}$/.test(codigo);
};

/**
 * Validar nombre de producto
 * @param {string} nombre 
 * @returns {boolean}
 */
const isNombreValido = (nombre) => {
    if (!nombre || typeof nombre !== 'string') return false;
    const nombreTrimmed = nombre.trim();
    return nombreTrimmed.length >= 3 && nombreTrimmed.length <= 100;
};

/**
 * Validar cantidad de stock
 * @param {number|string} stock 
 * @returns {boolean}
 */
const isStockValido = (stock) => {
    if (stock === null || stock === undefined) return true; // Stock es opcional
    const stockNum = parseInt(stock);
    return !isNaN(stockNum) && stockNum >= 0 && Number.isInteger(stockNum);
};

/**
 * Validar datos de producto
 * @param {Object} producto 
 * @returns {Object} { isValid, errors, data }
 */
const validateProducto = (producto) => {
    const errors = [];
    const data = { ...producto };

    // Validar nombre
    if (!isNombreValido(producto.nombre)) {
        errors.push('El nombre debe tener entre 3 y 100 caracteres');
    } else {
        data.nombre = producto.nombre.trim();
    }

    // Validar precio
    if (!isPrecioValido(producto.precio)) {
        errors.push('El precio debe ser un número positivo con máximo 2 decimales');
    } else {
        data.precio = parseFloat(producto.precio);
    }

    // Validar stock
    if (!isStockValido(producto.stock)) {
        errors.push('El stock debe ser un número entero positivo o cero');
    } else {
        data.stock = parseInt(producto.stock || 0);
    }

    // Validar código de barras
    if (producto.codigo_barras && !isCodigoBarrasValido(producto.codigo_barras)) {
        errors.push('El código de barras debe tener entre 8 y 13 dígitos numéricos');
    }

    return {
        isValid: errors.length === 0,
        errors,
        data
    };
};

/**
 * Validar array de productos para venta
 * @param {Array} productos 
 * @returns {Object} { isValid, errors, data }
 */
const validateProductosVenta = (productos) => {
    if (!Array.isArray(productos) || productos.length === 0) {
        return {
            isValid: false,
            errors: ['Debe incluir al menos un producto'],
            data: []
        };
    }

    const errors = [];
    const data = productos.map((item, index) => {
        const itemErrors = [];
        const validatedItem = { ...item };

        if (!item.producto_id || !Number.isInteger(parseInt(item.producto_id))) {
            itemErrors.push(`Producto #${index + 1}: ID de producto inválido`);
        } else {
            validatedItem.producto_id = parseInt(item.producto_id);
        }

        if (!item.cantidad || !Number.isInteger(parseInt(item.cantidad)) || parseInt(item.cantidad) < 1) {
            itemErrors.push(`Producto #${index + 1}: La cantidad debe ser un número entero mayor a 0`);
        } else {
            validatedItem.cantidad = parseInt(item.cantidad);
        }

        if (!isPrecioValido(item.precio_unitario)) {
            itemErrors.push(`Producto #${index + 1}: El precio unitario debe ser un número positivo con máximo 2 decimales`);
        } else {
            validatedItem.precio_unitario = parseFloat(item.precio_unitario);
            validatedItem.subtotal = validatedItem.precio_unitario * validatedItem.cantidad;
        }

        errors.push(...itemErrors);
        return validatedItem;
    });

    return {
        isValid: errors.length === 0,
        errors,
        data
    };
};

/**
 * Validar credenciales de usuario
 * @param {string} usuario 
 * @param {string} contrasena 
 * @returns {Object} { isValid, errors }
 */
const validateCredenciales = (usuario, contrasena) => {
    const errors = [];

    if (!usuario || typeof usuario !== 'string' || usuario.trim().length < 3) {
        errors.push('El usuario debe tener al menos 3 caracteres');
    }

    if (!contrasena || typeof contrasena !== 'string' || contrasena.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Formatear mensaje de error de SQLite
 * @param {Error} error 
 * @returns {string}
 */
const formatSQLiteError = (error) => {
    if (!error || !error.message) return 'Error desconocido';

    if (error.message.includes('UNIQUE constraint failed')) {
        if (error.message.includes('codigo_barras')) {
            return 'Ya existe un producto con ese código de barras';
        }
        return 'Ya existe un registro con ese identificador único';
    }

    if (error.message.includes('FOREIGN KEY constraint failed')) {
        return 'No se puede eliminar porque tiene registros relacionados';
    }

    if (error.message.includes('no such table')) {
        return 'Error en la base de datos: Tabla no encontrada';
    }

    if (error.message.includes('syntax error')) {
        return 'Error en la consulta SQL';
    }

    return 'Error en la base de datos';
        if (error.message.includes('codigo_barras')) {
            return 'El código de barras ya existe';
        }
        if (error.message.includes('usuario')) {
            return 'El nombre de usuario ya existe';
        }
    }
    if (error.message.includes('FOREIGN KEY constraint failed')) {
        return 'Error de referencia: el producto o venta no existe';
    }
    return 'Error en la base de datos';
};

module.exports = {
    isPrecioValido,
    isCodigoBarrasValido,
    isNombreValido,
    isStockValido,
    validateProducto,
    validateProductosVenta,
    validateCredenciales,
    formatSQLiteError
};