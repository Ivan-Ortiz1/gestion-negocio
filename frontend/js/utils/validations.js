// frontend/js/utils/validations.js

/**
 * Validar formulario de producto
 * @param {HTMLFormElement} form 
 * @returns {Object} { isValid, errors, data }
 */
export function validateProductoForm(form) {
    const errors = [];
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Validar nombre
    if (!data.nombre || data.nombre.trim().length < 3) {
        errors.push('El nombre debe tener al menos 3 caracteres');
    }

    // Validar precio
    const precio = parseFloat(data.precio);
    if (isNaN(precio) || precio < 0) {
        errors.push('El precio debe ser un número válido mayor o igual a 0');
    }

    // Validar stock
    const stock = parseInt(data.stock);
    if (isNaN(stock) || stock < 0) {
        errors.push('El stock debe ser un número entero positivo');
    }

    // Validar código de barras (opcional)
    if (data.codigo_barras && !/^[0-9]{8,13}$/.test(data.codigo_barras)) {
        errors.push('El código de barras debe tener entre 8 y 13 dígitos numéricos');
    }

    return {
        isValid: errors.length === 0,
        errors,
        data: {
            ...data,
            precio,
            stock
        }
    };
}

/**
 * Validar detalle de venta
 * @param {Array} productos 
 * @returns {Object} { isValid, errors }
 */
export function validateDetalleVenta(productos) {
    const errors = [];

    if (!Array.isArray(productos) || productos.length === 0) {
        errors.push('Debe agregar al menos un producto');
        return { isValid: false, errors };
    }

    productos.forEach((item, index) => {
        if (!item.producto_id) {
            errors.push(`Producto #${index + 1}: Seleccione un producto válido`);
        }
        if (!item.cantidad || item.cantidad < 1) {
            errors.push(`Producto #${index + 1}: La cantidad debe ser mayor a 0`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validar credenciales de usuario
 * @param {string} usuario 
 * @param {string} contrasena 
 * @returns {Object} { isValid, errors }
 */
export function validateCredenciales(usuario, contrasena) {
    const errors = [];

    if (!usuario || usuario.trim().length < 3) {
        errors.push('El usuario debe tener al menos 3 caracteres');
    }

    if (!contrasena || contrasena.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Mostrar errores en la interfaz
 * @param {Array} errors 
 * @param {HTMLElement} container 
 */
export function displayErrors(errors, container) {
    if (!container) return;

    // Limpiar errores anteriores
    container.innerHTML = '';
    
    if (errors && errors.length > 0) {
        const errorList = document.createElement('ul');
        errorList.className = 'text-red-500 text-sm mt-2 list-disc pl-5';
        
        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            errorList.appendChild(li);
        });
        
        container.appendChild(errorList);
    }
}

/**
 * Manejar errores de la API
 * @param {Error} error 
 * @returns {string}
 */
export function handleApiError(error) {
    if (error.response) {
        // Error del servidor con respuesta
        return error.response.data?.message || 'Error en el servidor';
    } else if (error.request) {
        // Error de red
        return 'Error de conexión. Verifique su conexión a internet.';
    } else {
        // Otro tipo de error
        return 'Error inesperado. Por favor, intente nuevamente.';
    }
}