import { mostrarMensaje, formatoGuarani } from "./utils.js";
import { productosCache, cargarProductos, setupAutocompleteProductos, actualizarSelectProductos } from "./productos.js";
import CONFIG from "./config.js";

const API_BASE = CONFIG?.API_BASE_URL || "";

let detalle = [];

export function agregarProducto(productoId, cantidad = 1) {
    if (!productoId) return mostrarMensaje('Producto inválido', "error");
    if (cantidad <= 0 || isNaN(cantidad)) return mostrarMensaje('Cantidad debe ser mayor a 0', "error");

    const producto = productosCache.find(p => p.id === productoId);
    if (!producto) return mostrarMensaje('Producto no encontrado', "error");

    const existing = detalle.find(p => p.producto_id === productoId);
    const stockDisponible = producto.stock - (existing?.cantidad || 0);
    if (cantidad > stockDisponible) return mostrarMensaje(`Stock insuficiente. Disponible: ${stockDisponible}`, "error");

    if (existing) existing.cantidad += cantidad;
    else detalle.push({ producto_id: productoId, cantidad, nombre: producto.nombre, precio: producto.precio });

    renderDetalle(productoId);
    actualizarSelectProductos(detalle);
    mostrarMensaje("Producto agregado al detalle", "success");
}

export function renderDetalle(resaltarId = null) {
    const tbody = document.querySelector('#tabla-detalle tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let total = 0;

    detalle.forEach(d => {
        const subtotal = d.cantidad * d.precio;
        total += subtotal;
        const tr = document.createElement('tr');
        tr.className = resaltarId === d.producto_id ? "bg-green-100 transition" : "";
        tr.innerHTML = `
            <td class="border px-2 py-1">${d.nombre}</td>
            <td class="border px-2 py-1">
                <input type="number" min="1" class="w-16 border rounded text-center cantidad-editar" data-id="${d.producto_id}" value="${d.cantidad}">
            </td>
            <td class="border px-2 py-1">${formatoGuarani(d.precio)}</td>
            <td class="border px-2 py-1">${formatoGuarani(subtotal)}</td>
            <td class="border px-2 py-1 text-center">
                <button class="bg-red-500 text-white px-2 py-1 rounded eliminarProducto" data-id="${d.producto_id}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('totalVenta').textContent = `Total: ${formatoGuarani(total)}`;

    document.querySelectorAll('.cantidad-editar').forEach(input => {
        input.addEventListener('change', e => {
            const id = parseInt(e.target.dataset.id);
            let nuevaCantidad = parseInt(e.target.value);
            if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
                nuevaCantidad = 1;
                e.target.value = 1;
            }

            const producto = productosCache.find(p => p.id === id);
            const cantidadEnDetalle = detalle
                .filter(d => d.producto_id === id)
                .reduce((sum, d) => sum + d.cantidad, 0);

            const stockDisponible = producto.stock - (cantidadEnDetalle - nuevaCantidad);
            if (nuevaCantidad > stockDisponible) {
                mostrarMensaje(`Cantidad supera stock disponible: ${stockDisponible}`, "error");
                nuevaCantidad = stockDisponible;
                e.target.value = stockDisponible;
            }

            const existing = detalle.find(d => d.producto_id === id);
            existing.cantidad = nuevaCantidad;

            renderDetalle();
            actualizarSelectProductos(detalle);
        });
    });

    document.querySelectorAll('.eliminarProducto').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = parseInt(e.target.dataset.id);
            detalle = detalle.filter(d => d.producto_id !== id);
            renderDetalle();
            actualizarSelectProductos(detalle);
            mostrarMensaje("Producto eliminado del detalle", "success");
        });
    });
}

function limpiarDetalle() {
    detalle = [];
    renderDetalle();
    actualizarSelectProductos(detalle);
}

export async function initVentas(apiBase = API_BASE) {
    await cargarProductos();
    setupAutocompleteProductos('productoInput', 'producto', detalle);

    document.getElementById('agregar-producto')?.addEventListener('click', () => {
        const productoId = parseInt(document.getElementById('producto').value);
        const cantidad = parseInt(document.getElementById('cantidad').value);
        agregarProducto(productoId, cantidad);
        document.getElementById('cantidad').value = 1;
        document.getElementById('productoInput').value = '';
    });

    document.getElementById('codigoBarras')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const codigo = e.target.value.trim();
            if (!codigo.match(/^[\w-]+$/)) return mostrarMensaje('Código de barras inválido', "error");
            const producto = productosCache.find(p => p.codigo_barras === codigo);
            if (!producto) return mostrarMensaje('Producto no encontrado', "error");
            agregarProducto(producto.id, 1);
            e.target.value = '';
        }
    });

    document.getElementById('form-venta')?.addEventListener('submit', async e => {
        e.preventDefault();

        if (detalle.length === 0) return mostrarMensaje('Agrega al menos un producto', "error");

        try {
            await fetch(`${apiBase}/ventas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productos: detalle }),
                credentials: 'include'
            });
            limpiarDetalle();
            await cargarProductos();
            mostrarMensaje('Venta registrada con éxito', "success");
        } catch (error) {
            mostrarMensaje('Error al registrar la venta', "error");
            console.error(error);
        }
    });

    document.getElementById("finalizarVenta")?.addEventListener("click", () => {
        if (detalle.length === 0) return mostrarMensaje("No hay productos en la venta", "error");
        document.getElementById("form-venta").requestSubmit();
    });
}
