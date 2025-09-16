const API_PRODUCTOS = "http://localhost:3000/productos";
let productosCache = []; // Cache para autocompletado y ventas

// Elementos HTML
const tablaProductosBody = document.querySelector("#tabla-productos tbody");
const formProducto = document.getElementById("form-producto");

// Formato guaraní
function formatoGuarani(valor) {
    return valor.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' });
}

// Mostrar mensajes tipo toast
function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById("mensaje");
    if (!mensajeDiv) return;
    mensajeDiv.textContent = texto;
    mensajeDiv.className = tipo === "success"
        ? "bg-green-500 text-white p-2 rounded my-2 transition"
        : "bg-red-500 text-white p-2 rounded my-2 transition";
    mensajeDiv.style.display = "block";
    setTimeout(() => { mensajeDiv.style.display = "none"; }, 3000);
}

// Cargar productos
async function cargarProductos() {
    try {
        const res = await fetch(API_PRODUCTOS);
        const productos = await res.json();
        productosCache = productos; // actualizar cache
        tablaProductosBody.innerHTML = "";

        productos.forEach(p => {
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
    } catch (error) {
        console.error(error);
        mostrarMensaje("Error al cargar productos", "error");
    }
}

// Agregar eventos a botones guardar/eliminar
function agregarEventosProductos() {
    document.querySelectorAll(".guardar").forEach(btn => {
        btn.addEventListener("click", async () => {
            const tr = btn.closest("tr");
            const id = btn.dataset.id;
            const nombre = tr.querySelector(".nombre-edit").value.trim();
            const descripcion = tr.querySelector(".descripcion-edit").value.trim();
            const precio = parseFloat(tr.querySelector(".precio-edit").value);
            const stock = parseInt(tr.querySelector(".stock-edit").value);

            // Validaciones
            if (!nombre) return mostrarMensaje("El nombre es obligatorio", "error");
            if (isNaN(precio) || precio < 0) return mostrarMensaje("Precio inválido", "error");
            if (isNaN(stock) || stock < 0) return mostrarMensaje("Stock inválido", "error");

            const producto = { id, nombre, descripcion, precio, stock };
            await guardarProducto(producto);
            mostrarMensaje("Producto actualizado", "success");
        });
    });

    document.querySelectorAll(".eliminar").forEach(btn => {
        btn.addEventListener("click", () => eliminarProducto(btn.dataset.id));
    });
}

// Crear o editar producto
async function guardarProducto(producto) {
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
        mostrarMensaje("Error al guardar producto", "error");
    }
}

// Eliminar producto
async function eliminarProducto(id) {
    try {
        await fetch(`${API_PRODUCTOS}/${id}`, { method: "DELETE" });
        mostrarMensaje("Producto eliminado", "success");
        await cargarProductos();
    } catch (error) {
        console.error(error);
        mostrarMensaje("Error al eliminar producto", "error");
    }
}

// Evento submit del formulario
formProducto?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreProducto").value.trim();
    const descripcion = document.getElementById("descripcionProducto").value.trim();
    const precio = parseFloat(document.getElementById("precioProducto").value);
    const stock = parseInt(document.getElementById("stockProducto").value);
    const id = document.getElementById("idProducto").value || null;

    // Validaciones
    if (!nombre) return mostrarMensaje("El nombre es obligatorio", "error");
    if (isNaN(precio) || precio < 0) return mostrarMensaje("Precio inválido", "error");
    if (isNaN(stock) || stock < 0) return mostrarMensaje("Stock inválido", "error");

    const producto = { id, nombre, descripcion, precio, stock };
    await guardarProducto(producto);
    mostrarMensaje("Producto agregado", "success");
    formProducto.reset();
});

// Inicialización
document.addEventListener("DOMContentLoaded", cargarProductos);
