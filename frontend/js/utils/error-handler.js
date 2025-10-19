// frontend/js/utils/error-handler.js

/**
 * Muestra un mensaje de error en la interfaz
 * @param {string|Error} error - Error a mostrar
 * @param {HTMLElement} container - Contenedor donde mostrar el error
 */
export function showError(error, container) {
    if (!container) return;

    // Limpiar errores anteriores
    container.innerHTML = '';
    container.classList.add('bg-red-100', 'border', 'border-red-400', 'text-red-700', 'px-4', 'py-3', 'rounded', 'mb-4');
    
    let message = '';
    let errorDetail = null;

    // Manejar diferentes tipos de error
    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    } else if (error && error.response) {
        // Error de API con respuesta
        message = error.response.data?.message || 'Error en el servidor';
        errorDetail = error.response.data?.errors;
    } else if (error && error.request) {
        // Error de red
        message = 'Error de conexión. Verifique su conexión a internet.';
    } else {
        // Otro tipo de error
        message = 'Error inesperado. Por favor, intente nuevamente.';
    }

    // Crear contenido del mensaje de error
    const messageElement = document.createElement('p');
    messageElement.className = 'font-bold mb-2';
    messageElement.textContent = message;
    container.appendChild(messageElement);

    // Si hay detalles del error, mostrarlos
    if (errorDetail && Array.isArray(errorDetail)) {
        const ul = document.createElement('ul');
        ul.className = 'list-disc list-inside';
        errorDetail.forEach(detail => {
            const li = document.createElement('li');
            li.textContent = detail;
            ul.appendChild(li);
        });
        container.appendChild(ul);
    }
}

/**
 * Muestra un mensaje de éxito en la interfaz
 * @param {string} message - Mensaje a mostrar
 * @param {HTMLElement} container - Contenedor donde mostrar el mensaje
 */
export function showSuccess(message, container) {
    if (!container) return;

    // Limpiar contenido anterior
    container.innerHTML = '';
    container.classList.add('bg-green-100', 'border', 'border-green-400', 'text-green-700', 'px-4', 'py-3', 'rounded', 'mb-4');

    const messageElement = document.createElement('p');
    messageElement.className = 'font-bold';
    messageElement.textContent = message;
    container.appendChild(messageElement);

    // Remover el mensaje después de 3 segundos
    setTimeout(() => {
        container.innerHTML = '';
        container.classList.remove('bg-green-100', 'border', 'border-green-400', 'text-green-700', 'px-4', 'py-3', 'rounded', 'mb-4');
    }, 3000);
}

/**
 * Maneja errores específicos de la aplicación
 * @param {Error} error 
 * @returns {string}
 */
export function handleAppError(error) {
    if (!error.response) {
        return 'Error de conexión. Verifique su conexión a internet.';
    }

    const status = error.response.status;
    const errorCode = error.response.data?.error;

    switch (errorCode) {
        case 'DUPLICATE_BARCODE':
            return 'Ya existe un producto con ese código de barras';
        case 'INSUFFICIENT_STOCK':
            return 'No hay suficiente stock disponible';
        case 'PRODUCT_HAS_SALES':
            return 'No se puede eliminar el producto porque tiene ventas asociadas';
        default:
            // Manejar por código de estado HTTP
            switch (status) {
                case 400:
                    return error.response.data?.message || 'Datos inválidos';
                case 401:
                    return 'No autorizado. Por favor, inicie sesión';
                case 403:
                    return 'No tiene permisos para realizar esta acción';
                case 404:
                    return 'Recurso no encontrado';
                case 500:
                    return 'Error en el servidor. Por favor, intente más tarde';
                default:
                    return 'Error inesperado. Por favor, intente nuevamente';
            }
    }
}

/**
 * Valida y formatea datos de formulario
 * @param {FormData} formData 
 * @param {Object} schema - Esquema de validación { campo: { required, type, validate } }
 * @returns {Object} { isValid, errors, data }
 */
export function validateForm(formData, schema) {
    const errors = [];
    const data = {};

    for (const [field, rules] of Object.entries(schema)) {
        const value = formData.get(field);

        // Validar requerido
        if (rules.required && (!value || value.trim() === '')) {
            errors.push(`El campo ${field} es obligatorio`);
            continue;
        }

        // Si el campo está vacío y no es requerido, continuar
        if (!value && !rules.required) {
            continue;
        }

        // Validar tipo
        if (rules.type) {
            let typedValue;
            switch (rules.type) {
                case 'number':
                    typedValue = Number(value);
                    if (isNaN(typedValue)) {
                        errors.push(`El campo ${field} debe ser un número`);
                        continue;
                    }
                    break;
                case 'integer':
                    typedValue = parseInt(value);
                    if (isNaN(typedValue) || !Number.isInteger(typedValue)) {
                        errors.push(`El campo ${field} debe ser un número entero`);
                        continue;
                    }
                    break;
                case 'decimal':
                    typedValue = parseFloat(value);
                    if (isNaN(typedValue)) {
                        errors.push(`El campo ${field} debe ser un número decimal`);
                        continue;
                    }
                    break;
                // Agregar más tipos según necesidad
            }
            data[field] = typedValue;
        } else {
            data[field] = value;
        }

        // Validar con función personalizada
        if (rules.validate && typeof rules.validate === 'function') {
            const validationError = rules.validate(value);
            if (validationError) {
                errors.push(validationError);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        data
    };
}