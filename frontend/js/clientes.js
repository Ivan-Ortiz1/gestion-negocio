const API_CLIENTES = "http://localhost:3000/clientes";

// Elementos HTML
const tablaClientesBody = document.querySelector("#tabla-clientes tbody");
const formCliente = document.getElementById("form-cliente");

// Cargar clientes
async function cargarClientes() {
    const res = await fetch(API_CLIENTES);
    const clientes = await res.json();
    tablaClientesBody.innerHTML = "";

    clientes.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="border px-2 py-1">${c.id}</td>
            <td class="border px-2 py-1">${c.nombre}</td>
            <td class="border px-2 py-1">${c.correo || ''}</td>
            <td class="border px-2 py-1">${c.telefono || ''}</td>
            <td class="border px-2 py-1">
                <button class="bg-yellow-400 text-white px-2 py-1 rounded editar" data-id="${c.id}">Editar</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded eliminar" data-id="${c.id}">Eliminar</button>
            </td>
        `;
        tablaClientesBody.appendChild(tr);
    });

    agregarEventosClientes();
}

// Agregar eventos a botones
function agregarEventosClientes() {
    document.querySelectorAll(".editar").forEach(btn => {
        btn.addEventListener("click", () => editarCliente(btn.dataset.id));
    });
    document.querySelectorAll(".eliminar").forEach(btn => {
        btn.addEventListener("click", () => eliminarCliente(btn.dataset.id));
    });
}

// Crear o editar cliente
async function guardarCliente(cliente) {
    const metodo = cliente.id ? "PUT" : "POST";
    const url = cliente.id ? `${API_CLIENTES}/${cliente.id}` : API_CLIENTES;

    await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente)
    });

    await cargarClientes();
}

// Eliminar cliente
async function eliminarCliente(id) {
    await fetch(`${API_CLIENTES}/${id}`, { method: "DELETE" });
    await cargarClientes();
}

// Rellenar formulario para editar
async function editarCliente(id) {
    const res = await fetch(`${API_CLIENTES}/${id}`);
    const c = await res.json();
    document.getElementById("nombreCliente").value = c.nombre;
    document.getElementById("correoCliente").value = c.correo || '';
    document.getElementById("telefonoCliente").value = c.telefono || '';
    document.getElementById("idCliente").value = c.id;
}

// Evento submit del formulario
formCliente?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cliente = {
        id: document.getElementById("idCliente").value,
        nombre: document.getElementById("nombreCliente").value,
        correo: document.getElementById("correoCliente").value,
        telefono: document.getElementById("telefonoCliente").value
    };
    await guardarCliente(cliente);
    formCliente.reset();
});

// Inicialización
document.addEventListener("DOMContentLoaded", cargarClientes);
