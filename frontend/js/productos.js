const API_PRODUCTOS = "http://localhost:3000/productos";

// Elementos HTML
const tablaProductosBody = document.querySelector("#tabla-productos tbody");
const formProducto = document.getElementById("form-producto");

// Función para formatear moneda a guaraníes
function formatoGuarani(valor) {
    return valor.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' });
}

// Cargar productos
async function cargarProductos() {
    const res = await fetch(API_PRODUCTOS);
    const productos = await res.json();
    tablaProductosBody.innerHTML = "";

    productos.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="border px-2 py-1">${p.id}</td>
            <td class="border px-2 py-1">${p.nombre}</td>
            <td class="border px-2 py-1">${p.descripcion}</td>
            <td class="border px-2 py-1">${formatoGuarani(p.precio)}</td>
            <td class="border px-2 py-1">${p.stock}</td>
            <td class="border px-2 py-1">
                <button class="bg-yellow-400 text-white px-2 py-1 rounded editar" data-id="${p.id}">Editar</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded eliminar" data-id="${p.id}">Eliminar</button>
            </td>
        `;
        tablaProductosBody.appendChild(tr);
    });

    agregarEventosProductos();
}

// Agregar eventos a botones editar/eliminar
function agregarEventosProductos() {
    document.querySelectorAll(".editar").forEach(btn => {
        btn.addEventListener("click", () => editarProducto(btn.dataset.id));
    });
    document.querySelectorAll(".eliminar").forEach(btn => {
        btn.addEventListener("click", () => eliminarProducto(btn.dataset.id));
    });
}

// Crear o editar producto
async function guardarProducto(producto) {
    const metodo = producto.id ? "PUT" : "POST";
    const url = producto.id ? `${API_PRODUCTOS}/${producto.id}` : API_PRODUCTOS;

    await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto)
    });

    await cargarProductos();
}

// Eliminar producto
async function eliminarProducto(id) {
    await fetch(`${API_PRODUCTOS}/${id}`, { method: "DELETE" });
    await cargarProductos();
}

// Rellenar formulario para editar
async function editarProducto(id) {
    const res = await fetch(`${API_PRODUCTOS}/${id}`);
    const p = await res.json();
    document.getElementById("nombreProducto").value = p.nombre;
    document.getElementById("descripcionProducto").value = p.descripcion;
    document.getElementById("precioProducto").value = p.precio;
    document.getElementById("stockProducto").value = p.stock;
    document.getElementById("idProducto").value = p.id;
}

// Evento submit del formulario
formProducto?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const producto = {
        id: document.getElementById("idProducto").value,
        nombre: document.getElementById("nombreProducto").value,
        descripcion: document.getElementById("descripcionProducto").value,
        precio: parseFloat(document.getElementById("precioProducto").value),
        stock: parseInt(document.getElementById("stockProducto").value)
    };
    await guardarProducto(producto);
    formProducto.reset();
});

// Inicialización
document.addEventListener("DOMContentLoaded", cargarProductos);
