import { mostrarMensaje, mostrarLoading, confirmar, formatoGuarani } from "./utils.js";
import CONFIG from "./config.js";

export let productosCache = []; // Cache global de productos

const API_PRODUCTOS = `${CONFIG.API_BASE_URL}/productos`;

// Tabla y formulario
const tablaProductosBody = document.querySelector("#tabla-productos tbody");
const formProducto = document.getElementById("form-producto");

// Cargar productos desde API
export async function cargarProductos() {
    mostrarLoading(true);
    try {
        const res = await fetch(API_PRODUCTOS);
        const productos = await res.json();
        productosCache = productos;
        renderTablaProductos();
        actualizarSelectProductos();
    } catch (error) {
        mostrarMensaje("Error al cargar productos", "error");
    } finally {
        mostrarLoading(false);
    }
}

// Renderizar tabla de productos editable
export function renderTablaProductos() {
    if (!tablaProductosBody) return;
    tablaProductosBody.innerHTML = "";

    productosCache.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="border px-2 py-1">${p.id}</td>
            <td class="border px-2 py-1">
                <input type="text" class="border w-full px-1 py-0.5 rounded nombre-edit" value="${p.nombre}">
            </td>
            <td class="border px-2 py-1">
                <input type="text" class="border w-full px-1 py-0.5 rounded descripcion-edit" value="${p.descripcion}">
            </td>
            <td class="border px-2 py-1">
                <input type="number" class="border w-full px-1 py-0.5 rounded precio-edit" min="0" value="${p.precio}">
            </td>
            <td class="border px-2 py-1">
                <input type="number" class="border w-full px-1 py-0.5 rounded stock-edit" min="0" value="${p.stock}">
            </td>
            <td class="border px-2 py-1 flex gap-1">
                <button class="bg-green-500 text-white px-2 py-1 rounded guardar" data-id="${p.id}">Guardar</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded eliminar" data-id="${p.id}">Eliminar</button>
            </td>
        `;
        tablaProductosBody.appendChild(tr);
    });

    agregarEventosProductos();
}

// Agregar eventos de guardar y eliminar
export function agregarEventosProductos() {
    document.querySelectorAll(".guardar").forEach(btn => {
        btn.addEventListener("click", async () => {
            const tr = btn.closest("tr");
            const id = btn.dataset.id;
            const nombre = tr.querySelector(".nombre-edit").value.trim();
            const descripcion = tr.querySelector(".descripcion-edit").value.trim();
            const precio = parseFloat(tr.querySelector(".precio-edit").value);
            const stock = parseInt(tr.querySelector(".stock-edit").value);

            // Validaciones
            if (!nombre) return mostrarMensaje("error", "El nombre es obligatorio");
            if (isNaN(precio) || precio < 0) return mostrarMensaje("error", "Precio inválido");
            if (isNaN(stock) || stock < 0) return mostrarMensaje("error", "Stock inválido");

            const producto = { id, nombre, descripcion, precio, stock };
            await guardarProducto(producto);
            mostrarMensaje("success", "Producto actualizado");
        });
    });

    document.querySelectorAll(".eliminar").forEach(btn => {
        btn.addEventListener("click", () => eliminarProducto(btn.dataset.id));
    });
}

// Guardar o actualizar producto
export async function guardarProducto(producto) {
    try {
        const metodo = producto.id ? "PUT" : "POST";
        const url = producto.id ? `${API_PRODUCTOS}/${producto.id}` : API_PRODUCTOS;

        await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto)
        });

        await cargarProductos();
    } catch (error) {
        console.error(error);
        mostrarMensaje("error", "Error al guardar producto");
    }
}

// Eliminar producto con confirmación
export async function eliminarProducto(id) {
    if (!confirmar("¿Seguro que deseas eliminar este producto?")) return;
    mostrarLoading(true);
    try {
        await fetch(`${API_PRODUCTOS}/${id}`, { method: "DELETE" });
        mostrarMensaje("Producto eliminado", "success");
        await cargarProductos();
    } catch (error) {
        mostrarMensaje("Error al eliminar producto", "error");
    } finally {
        mostrarLoading(false);
    }
}

// Actualizar select de productos para ventas
export function actualizarSelectProductos(detalle = []) {
    const productoSelect = document.getElementById('producto');
    if (!productoSelect) return;

    productoSelect.innerHTML = '<option value="">Seleccione un producto</option>';
    productosCache.forEach(p => {
        const stockDisponible = p.stock - (detalle.find(d => d.producto_id === p.id)?.cantidad || 0);
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.nombre} (Stock: ${stockDisponible}) - ${formatoGuarani(p.precio)}`;
        option.disabled = stockDisponible <= 0;
        productoSelect.appendChild(option);
    });
}

// Autocompletado productos para input
export function setupAutocompleteProductos(inputId, selectId, detalle = []) {
    const productoInput = document.getElementById(inputId);
    const productoSuggestions = document.getElementById(`${inputId}Suggestions`);
    productoInput.addEventListener('input', () => {
        const term = productoInput.value.toLowerCase();
        productoSuggestions.innerHTML = '';
        if (!term) return productoSuggestions.classList.add('hidden');

        const matches = productosCache.filter(p =>
            p.nombre.toLowerCase().includes(term) || (p.codigo_barras && p.codigo_barras.includes(term))
        );

        matches.forEach(p => {
            const stockDisponible = p.stock - (detalle.find(d => d.producto_id === p.id)?.cantidad || 0);
            const li = document.createElement('li');
            li.textContent = `${p.nombre} (Stock: ${stockDisponible}) - ${formatoGuarani(p.precio)}`;
            li.className = 'p-1 cursor-pointer hover:bg-gray-200';
            li.addEventListener('click', () => {
                productoInput.value = p.nombre;
                document.getElementById(selectId).value = p.id;
                productoSuggestions.classList.add('hidden');
            });
            productoSuggestions.appendChild(li);
        });

        productoSuggestions.classList.toggle('hidden', matches.length === 0);
    });

    document.addEventListener('click', e => {
        if (!productoInput.contains(e.target)) productoSuggestions.classList.add('hidden');
    });
}

// Submit del formulario principal
formProducto?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreProducto").value.trim();
    const descripcion = document.getElementById("descripcionProducto").value.trim();
    const precio = parseFloat(document.getElementById("precioProducto").value);
    const stock = parseInt(document.getElementById("stockProducto").value);
    const id = document.getElementById("idProducto").value || null;

    if (!nombre) {
        mostrarMensaje("El nombre es obligatorio", "error");
        document.getElementById("nombreProducto").focus();
        return;
    }
    if (isNaN(precio) || precio < 0) {
        mostrarMensaje("El precio debe ser un número positivo", "error");
        document.getElementById("precioProducto").focus();
        return;
    }
    if (isNaN(stock) || stock < 0) {
        mostrarMensaje("El stock debe ser un número positivo", "error");
        document.getElementById("stockProducto").focus();
        return;
    }

    const producto = { id, nombre, descripcion, precio, stock };
    await guardarProducto(producto);
    mostrarMensaje(id ? "Producto actualizado" : "Producto agregado", "success");
    formProducto.reset();
});

// Inicialización automática
document.addEventListener("DOMContentLoaded", cargarProductos);
