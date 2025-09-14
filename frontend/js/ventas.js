let detalle = []; // Productos agregados a la venta
let productosCache = []; // Guardar productos para fácil acceso

// Función para formatear valores a guaraníes
function formatoGuarani(valor) {
    return valor.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' });
}

// Cargar clientes y productos en los select
async function cargarSelects() {
    try {
        const clientesRes = await fetch('http://localhost:3000/api/clientes');
        const clientes = await clientesRes.json();
        const clienteSelect = document.getElementById('cliente');
        clienteSelect.innerHTML = '<option value="">Desconocido</option>';
        clientes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.nombre;
            clienteSelect.appendChild(option);
        });

        const productosRes = await fetch('http://localhost:3000/api/productos');
        productosCache = await productosRes.json();
        const productoSelect = document.getElementById('producto');
        productoSelect.innerHTML = '<option value="">Seleccione un producto</option>';
        productosCache.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.nombre} (Stock: ${p.stock}) - ${formatoGuarani(p.precio)}`;
            productoSelect.appendChild(option);
        });
    } catch (error) {
        mostrarMensaje("Error al cargar clientes o productos.", "error");
        console.error(error);
    }
}

// Función para agregar producto al detalle
function agregarProducto(productoId, cantidad = 1) {
    if (!productoId) return mostrarMensaje('Producto inválido', "error");

    const producto = productosCache.find(p => p.id === productoId);
    if (!producto) return mostrarMensaje('Producto no encontrado', "error");

    const existing = detalle.find(p => p.producto_id === productoId);
    if (existing) {
        if (existing.cantidad + cantidad > producto.stock) {
            return mostrarMensaje(`No puede superar el stock. Disponible: ${producto.stock}`, "error");
        }
        existing.cantidad += cantidad;
    } else {
        if (cantidad > producto.stock) {
            return mostrarMensaje(`Stock insuficiente. Disponible: ${producto.stock}`, "error");
        }
        detalle.push({
            producto_id: productoId,
            cantidad,
            nombre: producto.nombre,
            precio: producto.precio
        });
    }

    renderDetalle();
    mostrarMensaje("Producto agregado al detalle", "success");
}

// Botón para agregar desde select
document.getElementById('agregar-producto').addEventListener('click', () => {
    const productoSelect = document.getElementById('producto');
    const cantidadInput = document.getElementById('cantidad');
    const productoId = parseInt(productoSelect.value);
    const cantidad = parseInt(cantidadInput.value);

    if (!productoId) return mostrarMensaje('Seleccione un producto', "error");
    if (cantidad <= 0 || isNaN(cantidad)) return mostrarMensaje('Cantidad debe ser mayor a 0', "error");

    agregarProducto(productoId, cantidad);
    cantidadInput.value = '';
});

// Escaneo de código de barras
document.getElementById('codigoBarras').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const codigo = e.target.value.trim();
        if (!codigo) return;

        const producto = productosCache.find(p => p.codigo_barras === codigo);
        if (!producto) return mostrarMensaje('Producto no encontrado', "error");

        // Incrementar cantidad si ya está en el detalle
        const existing = detalle.find(p => p.producto_id === producto.id);
        if (existing) {
            if (existing.cantidad + 1 > producto.stock) {
                return mostrarMensaje(`No puede superar el stock. Disponible: ${producto.stock}`, "error");
            }
            existing.cantidad += 1;
            renderDetalle();
            mostrarMensaje("Cantidad del producto incrementada", "success");
        } else {
            agregarProducto(producto.id, 1);
        }

        e.target.value = ''; // Limpiar input
    }
});

// Renderizar detalle en la tabla
function renderDetalle() {
    const tbody = document.querySelector('#tabla-detalle tbody');
    tbody.innerHTML = '';
    let total = 0;

    detalle.forEach(d => {
        const subtotal = d.cantidad * d.precio;
        total += subtotal;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="border px-2 py-1">${d.nombre}</td>
            <td class="border px-2 py-1">${d.cantidad}</td>
            <td class="border px-2 py-1">${formatoGuarani(d.precio)}</td>
            <td class="border px-2 py-1">${formatoGuarani(subtotal)}</td>
            <td class="border px-2 py-1 text-center">
                <button class="bg-red-500 text-white px-2 py-1 rounded eliminarProducto" data-id="${d.producto_id}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('totalVenta').textContent = `Total: ${formatoGuarani(total)}`;

    document.querySelectorAll('.eliminarProducto').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            detalle = detalle.filter(d => d.producto_id !== id);
            renderDetalle();
            mostrarMensaje("Producto eliminado del detalle", "success");
        });
    });
}

// Registrar venta
document.getElementById('form-venta').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cliente_id = parseInt(document.getElementById('cliente').value) || null;

    if (detalle.length === 0) return mostrarMensaje('Agrega al menos un producto', "error");

    try {
        await fetch('http://localhost:3000/api/ventas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliente_id, productos: detalle })
        });

        detalle = [];
        renderDetalle();
        cargarVentas();
        cargarSelects();
        mostrarMensaje('Venta registrada con éxito', "success");
    } catch (error) {
        mostrarMensaje('Error al registrar la venta', "error");
        console.error(error);
    }
});

// Cargar ventas registradas
async function cargarVentas() {
    try {
        const res = await fetch('http://localhost:3000/api/ventas');
        const ventas = await res.json();
        const tbody = document.querySelector('#tabla-ventas tbody');
        tbody.innerHTML = '';
        ventas.forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="border px-2 py-1">${v.venta_id}</td>
                <td class="border px-2 py-1">${v.cliente_nombre}</td>
                <td class="border px-2 py-1">${v.fecha}</td>
                <td class="border px-2 py-1">${v.producto_nombre || ''}</td>
                <td class="border px-2 py-1">${v.cantidad || ''}</td>
                <td class="border px-2 py-1">${v.precio ? formatoGuarani(v.precio) : ''}</td>
                <td class="border px-2 py-1 font-bold">${v.total ? formatoGuarani(v.total) : formatoGuarani(0)}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        mostrarMensaje('Error al cargar ventas', "error");
        console.error(error);
    }
}

// Función para mostrar mensajes
function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById("mensaje");
    if (!mensajeDiv) return;

    mensajeDiv.textContent = texto;
    mensajeDiv.className = tipo === "success" 
        ? "bg-green-500 text-white p-2 rounded my-2"
        : "bg-red-500 text-white p-2 rounded my-2";

    mensajeDiv.style.display = "block";
    setTimeout(() => {
        mensajeDiv.style.display = "none";
    }, 3000);
}

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarSelects();
    cargarVentas();
});
