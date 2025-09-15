let detalle = []; // Productos agregados a la venta
let productosCache = []; // Guardar productos para fácil acceso
let clientesCache = [];  // Guardar clientes para autocompletado

// Función para formatear valores a guaraníes
function formatoGuarani(valor) {
    return valor.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' });
}

// Cargar clientes y productos
async function cargarSelects() {
    try {
        const clientesRes = await fetch('http://localhost:3000/api/clientes');
        clientesCache = await clientesRes.json();

        const clienteSelect = document.getElementById('cliente');
        clienteSelect.innerHTML = '<option value="">Desconocido</option>';
        clientesCache.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.nombre;
            clienteSelect.appendChild(option);
        });

        const productosRes = await fetch('http://localhost:3000/api/productos');
        productosCache = await productosRes.json();
        actualizarSelectProductos();
    } catch (error) {
        mostrarMensaje("Error al cargar clientes o productos.", "error");
        console.error(error);
        document.getElementById('form-venta').querySelectorAll('input, select, button').forEach(el => el.disabled = true);
    }
}

// Actualizar select de productos con stock disponible
function actualizarSelectProductos() {
    const productoSelect = document.getElementById('producto');
    productoSelect.innerHTML = '<option value="">Seleccione un producto</option>';
    productosCache.forEach(p => {
        const stockDisponible = p.stock - (detalle.find(d => d.producto_id === p.id)?.cantidad || 0);
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.nombre} (Stock: ${stockDisponible}) - ${formatoGuarani(p.precio)}`;
        option.disabled = stockDisponible <= 0;
        productoSelect.appendChild(option);
    });
}

// Autocompletado de clientes
const clienteInput = document.getElementById('clienteInput');
const clienteSuggestions = document.getElementById('clienteSuggestions');
clienteInput.addEventListener('input', () => {
    const term = clienteInput.value.toLowerCase();
    clienteSuggestions.innerHTML = '';
    if (!term) {
        clienteSuggestions.classList.add('hidden');
        return;
    }
    const matches = clientesCache.filter(c => c.nombre.toLowerCase().includes(term));
    matches.forEach(c => {
        const li = document.createElement('li');
        li.textContent = c.nombre;
        li.className = 'p-1 cursor-pointer hover:bg-gray-200';
        li.addEventListener('click', () => {
            clienteInput.value = c.nombre;
            document.getElementById('cliente').value = c.id;
            clienteSuggestions.classList.add('hidden');
        });
        clienteSuggestions.appendChild(li);
    });
    clienteSuggestions.classList.toggle('hidden', matches.length === 0);
});
document.addEventListener('click', e => {
    if (!clienteInput.contains(e.target)) clienteSuggestions.classList.add('hidden');
});

// Autocompletado de productos
const productoInput = document.getElementById('productoInput');
const productoSuggestions = document.getElementById('productoSuggestions');
productoInput.addEventListener('input', () => {
    const term = productoInput.value.toLowerCase();
    productoSuggestions.innerHTML = '';
    if (!term) {
        productoSuggestions.classList.add('hidden');
        return;
    }
    const matches = productosCache.filter(p => 
        p.nombre.toLowerCase().includes(term) || (p.codigo_barras && p.codigo_barras.includes(term))
    );
    matches.forEach(p => {
        const li = document.createElement('li');
        li.textContent = `${p.nombre} (Stock: ${p.stock}) - ${formatoGuarani(p.precio)}`;
        li.className = 'p-1 cursor-pointer hover:bg-gray-200';
        li.addEventListener('click', () => {
            productoInput.value = p.nombre;
            document.getElementById('producto').value = p.id;
            productoSuggestions.classList.add('hidden');
        });
        productoSuggestions.appendChild(li);
    });
    productoSuggestions.classList.toggle('hidden', matches.length === 0);
});
document.addEventListener('click', e => {
    if (!productoInput.contains(e.target)) productoSuggestions.classList.add('hidden');
});

// Agregar producto al detalle
function agregarProducto(productoId, cantidad = 1) {
    if (!productoId) return mostrarMensaje('Producto inválido', "error");
    if (cantidad <= 0 || isNaN(cantidad)) return mostrarMensaje('Cantidad debe ser mayor a 0', "error");

    const producto = productosCache.find(p => p.id === productoId);
    if (!producto) return mostrarMensaje('Producto no encontrado', "error");

    const existing = detalle.find(p => p.producto_id === productoId);
    const stockDisponible = producto.stock - (existing?.cantidad || 0);

    if (cantidad > stockDisponible) return mostrarMensaje(`Stock insuficiente. Disponible: ${stockDisponible}`, "error");

    if (existing) existing.cantidad += cantidad;
    else detalle.push({ producto_id: productoId, cantidad, nombre: producto.nombre, precio: producto.precio });

    renderDetalle();
    actualizarSelectProductos();
    mostrarMensaje("Producto agregado al detalle", "success");
}

// Validación de cantidad en tiempo real
document.getElementById('cantidad').addEventListener('input', e => {
    const productoId = parseInt(document.getElementById('producto').value);
    const cantidad = parseInt(e.target.value);
    const btnAgregar = document.getElementById('agregar-producto');

    if (!productoId || isNaN(cantidad) || cantidad <= 0) {
        btnAgregar.disabled = true;
        return;
    }
    const producto = productosCache.find(p => p.id === productoId);
    const existing = detalle.find(d => d.producto_id === productoId);
    const stockDisponible = producto.stock - (existing?.cantidad || 0);

    btnAgregar.disabled = cantidad > stockDisponible;
    if (cantidad > stockDisponible) mostrarMensaje(`Cantidad supera el stock disponible: ${stockDisponible}`, "error");
});

// Botón para agregar producto desde select/input
document.getElementById('agregar-producto').addEventListener('click', () => {
    const productoId = parseInt(document.getElementById('producto').value);
    const cantidad = parseInt(document.getElementById('cantidad').value);
    agregarProducto(productoId, cantidad);
    document.getElementById('cantidad').value = '';
    productoInput.value = '';
});

// Escaneo de código de barras
document.getElementById('codigoBarras').addEventListener('keypress', e => {
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
        btn.addEventListener('click', e => {
            const id = parseInt(e.target.dataset.id);
            detalle = detalle.filter(d => d.producto_id !== id);
            renderDetalle();
            actualizarSelectProductos();
            mostrarMensaje("Producto eliminado del detalle", "success");
        });
    });
}

// Registrar venta
document.getElementById('form-venta').addEventListener('submit', async e => {
    e.preventDefault();
    let cliente_id = parseInt(document.getElementById('cliente').value);
    cliente_id = isNaN(cliente_id) ? null : cliente_id;

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

// Mostrar mensajes
function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById("mensaje");
    if (!mensajeDiv) return;

    mensajeDiv.textContent = texto;
    mensajeDiv.className = tipo === "success" 
        ? "bg-green-500 text-white p-2 rounded my-2"
        : "bg-red-500 text-white p-2 rounded my-2";

    mensajeDiv.style.display = "block";
    setTimeout(() => { mensajeDiv.style.display = "none"; }, 3000);
}

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarSelects();
    cargarVentas();
});
