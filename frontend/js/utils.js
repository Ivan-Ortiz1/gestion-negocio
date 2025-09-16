// Formato guaraní
export function formatoGuarani(valor) {
    return valor.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' });
}

// Mensajes tipo toast centralizado
let mensajeTimeout;
export function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById("mensaje");
    if (!mensajeDiv) return;

    mensajeDiv.textContent = texto;
    mensajeDiv.className = tipo;
    mensajeDiv.style.display = "block";

    clearTimeout(mensajeTimeout);
    mensajeTimeout = setTimeout(() => { mensajeDiv.style.display = "none"; }, 3000);
}
