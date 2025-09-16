import { mostrarMensaje } from "./utils.js";

export let clientesCache = [];

export async function cargarClientes() {
    try {
        const res = await fetch('http://localhost:3000/api/clientes');
        clientesCache = await res.json();

        const clienteSelect = document.getElementById('cliente');
        if (!clienteSelect) return;

        clienteSelect.innerHTML = '<option value="">Desconocido</option>';
        clientesCache.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.nombre;
            clienteSelect.appendChild(option);
        });
    } catch (error) {
        mostrarMensaje("Error al cargar clientes", "error");
        console.error(error);
    }
}

export function setupAutocompleteClientes(inputId, selectId) {
    const clienteInput = document.getElementById(inputId);
    const clienteSuggestions = document.getElementById(`${inputId}Suggestions`);
    clienteInput.addEventListener('input', () => {
        const term = clienteInput.value.toLowerCase();
        clienteSuggestions.innerHTML = '';
        if (!term) return clienteSuggestions.classList.add('hidden');

        const matches = clientesCache.filter(c => c.nombre.toLowerCase().includes(term));
        matches.forEach(c => {
            const li = document.createElement('li');
            li.textContent = c.nombre;
            li.className = 'p-1 cursor-pointer hover:bg-gray-200';
            li.addEventListener('click', () => {
                clienteInput.value = c.nombre;
                document.getElementById(selectId).value = c.id;
                clienteSuggestions.classList.add('hidden');
            });
            clienteSuggestions.appendChild(li);
        });
        clienteSuggestions.classList.toggle('hidden', matches.length === 0);
    });
    document.addEventListener('click', e => {
        if (!clienteInput.contains(e.target)) clienteSuggestions.classList.add('hidden');
    });
}
