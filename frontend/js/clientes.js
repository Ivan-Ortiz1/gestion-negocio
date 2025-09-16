import { mostrarMensaje } from "./utils.js";
import { API_URL } from "./config.js";

export let clientesCache = [];

// Cargar clientes en memoria y en el <select>
export async function cargarClientes() {
    try {
        const res = await fetch(`${API_URL}/clientes`);
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        clientesCache = await res.json();

        const clienteSelect = document.getElementById("cliente");
        if (!clienteSelect) return;

        clienteSelect.innerHTML = '<option value="">Desconocido</option>';
        clientesCache.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = c.nombre;
            clienteSelect.appendChild(option);
        });
    } catch (error) {
        mostrarMensaje("Error al cargar clientes", "error");
        console.error("Error en cargarClientes:", error);
    }
}

// Autocomplete mejorado
export function setupAutocompleteClientes(inputId, selectId) {
    const clienteInput = document.getElementById(inputId);
    const clienteSuggestions = document.getElementById(`${inputId}Suggestions`);

    if (!clienteInput || !clienteSuggestions) return;

    let timeout;
    clienteInput.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const term = clienteInput.value.toLowerCase().trim();
            clienteSuggestions.innerHTML = "";
            if (!term) return clienteSuggestions.classList.add("hidden");

            const matches = clientesCache.filter(c =>
                c.nombre.toLowerCase().includes(term)
            );

            matches.forEach(c => {
                const li = document.createElement("li");
                li.textContent = c.nombre;
                li.className = "p-1 cursor-pointer hover:bg-gray-200";
                li.addEventListener("click", () => {
                    clienteInput.value = c.nombre;
                    document.getElementById(selectId).value = c.id;
                    clienteSuggestions.classList.add("hidden");
                });
                clienteSuggestions.appendChild(li);
            });

            clienteSuggestions.classList.toggle("hidden", matches.length === 0);
        }, 300); // debounce 300ms
    });

    // Cerrar al hacer click afuera
    document.addEventListener("click", e => {
        if (!clienteInput.contains(e.target)) {
            clienteSuggestions.classList.add("hidden");
        }
    });
}
