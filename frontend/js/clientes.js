import { mostrarMensaje } from "./utils.js";
import CONFIG from "./config.js";

export let clientesCache = [];

const API_CLIENTES = `${CONFIG.API_BASE_URL}/clientes`;

// Cargar clientes en memoria y en el <select>
export async function cargarClientes() {
    try {
        const res = await fetch(API_CLIENTES);
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        clientesCache = await res.json();

        const clienteSelect = document.getElementById("cliente");
        if (clienteSelect) {
            clienteSelect.innerHTML = '<option value="">Desconocido</option>';
            clientesCache.forEach(c => {
                const option = document.createElement("option");
                option.value = c.id;
                option.textContent = c.nombre;
                clienteSelect.appendChild(option);
            });
        }

        renderTablaClientes();
    } catch (error) {
        mostrarMensaje("Error al cargar clientes", "error");
        console.error("Error en cargarClientes:", error);
    }
}

// Renderizar tabla de clientes con edición y eliminación
function renderTablaClientes() {
    const tbody = document.querySelector("#tabla-clientes tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    clientesCache.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="border px-2 py-1">${c.id}</td>
            <td class="border px-2 py-1">
                <input type="text" class="border w-full px-1 py-0.5 rounded nombre-edit" value="${c.nombre}">
            </td>
            <td class="border px-2 py-1">
                <input type="email" class="border w-full px-1 py-0.5 rounded correo-edit" value="${c.correo || ''}">
            </td>
            <td class="border px-2 py-1">
                <input type="text" class="border w-full px-1 py-0.5 rounded telefono-edit" value="${c.telefono || ''}">
            </td>
            <td class="border px-2 py-1 flex gap-1">
                <button class="bg-green-500 text-white px-2 py-1 rounded guardar" data-id="${c.id}">Guardar</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded eliminar" data-id="${c.id}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    agregarEventosClientes();
}

// Agregar eventos de guardar y eliminar
function agregarEventosClientes() {
    document.querySelectorAll(".guardar").forEach(btn => {
        btn.addEventListener("click", async () => {
            const tr = btn.closest("tr");
            const id = btn.dataset.id;
            const nombre = tr.querySelector(".nombre-edit").value.trim();
            const correo = tr.querySelector(".correo-edit").value.trim();
            const telefono = tr.querySelector(".telefono-edit").value.trim();

            if (!nombre || !correo) return mostrarMensaje("error", "Nombre y correo son obligatorios");

            const cliente = { id, nombre, correo, telefono };
            await guardarCliente(cliente);
            mostrarMensaje("success", "Cliente actualizado");
        });
    });

    document.querySelectorAll(".eliminar").forEach(btn => {
        btn.addEventListener("click", () => eliminarCliente(btn.dataset.id));
    });
}

// Guardar o actualizar cliente
async function guardarCliente(cliente) {
    try {
        const metodo = cliente.id ? "PUT" : "POST";
        const url = cliente.id ? `${API_CLIENTES}/${cliente.id}` : API_CLIENTES;

        await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente)
        });

        await cargarClientes();
    } catch (error) {
        console.error(error);
        mostrarMensaje("error", "Error al guardar cliente");
    }
}

// Eliminar cliente
async function eliminarCliente(id) {
    try {
        await fetch(`${API_CLIENTES}/${id}`, { method: "DELETE" });
        mostrarMensaje("success", "Cliente eliminado");
        await cargarClientes();
    } catch (error) {
        console.error(error);
        mostrarMensaje("error", "Error al eliminar cliente");
    }
}

// Submit del formulario principal
document.getElementById("form-cliente")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreCliente").value.trim();
    const correo = document.getElementById("correoCliente").value.trim();
    const telefono = document.getElementById("telefonoCliente").value.trim();
    const id = document.getElementById("idCliente").value || null;

    if (!nombre) {
        mostrarMensaje("El nombre es obligatorio", "error");
        document.getElementById("nombreCliente").focus();
        return;
    }
    if (!correo || !correo.match(/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/)) {
        mostrarMensaje("Correo electrónico inválido", "error");
        document.getElementById("correoCliente").focus();
        return;
    }
    if (telefono && !telefono.match(/^\d{6,}$/)) {
        mostrarMensaje("Teléfono inválido", "error");
        document.getElementById("telefonoCliente").focus();
        return;
    }

    const cliente = { id, nombre, correo, telefono };
    await guardarCliente(cliente);
    mostrarMensaje(id ? "Cliente actualizado" : "Cliente agregado", "success");
    document.getElementById("form-cliente").reset();
    await cargarClientes();
});

// Inicialización automática
document.addEventListener("DOMContentLoaded", cargarClientes);

export { cargarClientes };
