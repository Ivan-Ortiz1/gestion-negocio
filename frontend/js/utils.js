// Formato guaraní
export function formatoGuarani(valor) {
    return valor.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' });
}

// Mensajes tipo toast centralizado
let mensajeTimeout;
export function mostrarMensaje(texto, tipo = "info", tiempo = 3000) {
    const mensajeDiv = document.getElementById("mensaje");
    if (!mensajeDiv) return;

    mensajeDiv.textContent = texto;
    mensajeDiv.className = tipo;
    mensajeDiv.style.display = "block";

    clearTimeout(mensajeTimeout);
    mensajeTimeout = setTimeout(() => { mensajeDiv.style.display = "none"; }, tiempo);
}

// Mostrar loading
export function mostrarLoading(mostrar = true) {
    let loadingDiv = document.getElementById("loading");
    if (!loadingDiv) {
        loadingDiv = document.createElement("div");
        loadingDiv.id = "loading";
        loadingDiv.className = "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50";
        loadingDiv.innerHTML = `<div class="bg-white p-6 rounded shadow text-lg font-bold text-blue-600 animate-pulse">Cargando...</div>`;
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.style.display = mostrar ? "flex" : "none";
}

// Confirmación simple
export function confirmar(mensaje = "¿Estás seguro?") {
    return window.confirm(mensaje);
}


<div id="mensaje" class="hidden"></div>
