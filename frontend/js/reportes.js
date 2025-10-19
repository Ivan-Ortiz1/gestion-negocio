// frontend/js/reportes.js
import CONFIG from './config.js';
import { formatoGuarani } from './utils.js';
import { mostrarMensaje, mostrarLoading } from './utils.js';

let ventasChart = null;

// Función principal de inicialización
export function initReportes() {
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    document.getElementById('fecha-inicio').value = inicioMes.toISOString().split('T')[0];
    document.getElementById('fecha-fin').value = hoy.toISOString().split('T')[0];

    // Event listeners
    document.getElementById('btn-generar').addEventListener('click', generarReportes);
    document.getElementById('btn-filtrar-stock').addEventListener('click', actualizarInventario);

    // Generar reportes iniciales
    generarReportes();
}

// Función para generar todos los reportes
async function generarReportes() {
    const fechaInicio = document.getElementById('fecha-inicio').value;
    const fechaFin = document.getElementById('fecha-fin').value;

    if (!fechaInicio || !fechaFin) {
        mostrarMensaje('Debe seleccionar ambas fechas', 'error');
        return;
    }

    mostrarLoading(true);
    try {
        await Promise.all([
            generarReporteVentas(fechaInicio, fechaFin),
            generarReporteProductos(fechaInicio, fechaFin),
            actualizarInventario()
        ]);
    } catch (error) {
        console.error('Error al generar reportes:', error);
        mostrarMensaje('Error al generar reportes', 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Reporte de ventas con gráfico
async function generarReporteVentas(inicio, fin) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/reportes/ventas?inicio=${inicio}&fin=${fin}`,
            { credentials: 'include' });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        const ventas = data.data;
        actualizarGraficoVentas(ventas);
        actualizarResumenVentas(ventas);

    } catch (error) {
        console.error('Error al generar reporte de ventas:', error);
        mostrarMensaje('Error al generar reporte de ventas', 'error');
    }
}

// Actualizar gráfico de ventas
function actualizarGraficoVentas(ventas) {
    const ctx = document.getElementById('grafico-ventas').getContext('2d');
    
    if (ventasChart) {
        ventasChart.destroy();
    }

    ventasChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ventas.map(v => new Date(v.fecha).toLocaleDateString()),
            datasets: [{
                label: 'Total Ventas Diarias',
                data: ventas.map(v => v.total_ingresos),
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatoGuarani(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatoGuarani(value);
                        }
                    }
                }
            }
        }
    });
}

// Actualizar resumen de ventas
function actualizarResumenVentas(ventas) {
    const totalVentas = ventas.reduce((sum, v) => sum + v.total_ventas, 0);
    const totalIngresos = ventas.reduce((sum, v) => sum + v.total_ingresos, 0);

    document.getElementById('total-ventas').textContent = totalVentas;
    document.getElementById('total-ingresos').textContent = formatoGuarani(totalIngresos);
}

// Reporte de productos más vendidos
async function generarReporteProductos(inicio, fin) {
    try {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/reportes/productos-mas-vendidos?inicio=${inicio}&fin=${fin}&limite=10`,
            { credentials: 'include' }
        );
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        const tbody = document.getElementById('tabla-productos-vendidos');
        tbody.innerHTML = data.data.map(p => `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-2 whitespace-nowrap">${p.nombre}</td>
                <td class="px-4 py-2 text-right">${p.total_vendido}</td>
                <td class="px-4 py-2 text-right">${formatoGuarani(p.total_ingresos)}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error al generar reporte de productos:', error);
        mostrarMensaje('Error al generar reporte de productos', 'error');
    }
}

// Actualizar tabla de inventario
async function actualizarInventario() {
    const stockMinimo = document.getElementById('stock-minimo').value;
    
    try {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/reportes/inventario${stockMinimo ? `?stockMinimo=${stockMinimo}` : ''}`,
            { credentials: 'include' }
        );
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        const tbody = document.getElementById('tabla-inventario');
        tbody.innerHTML = data.data.map(p => `
            <tr class="hover:bg-gray-50 ${p.stock <= 5 ? 'bg-red-50' : ''}">
                <td class="px-4 py-2 whitespace-nowrap">${p.nombre}</td>
                <td class="px-4 py-2 text-right ${p.stock <= 5 ? 'text-red-600 font-semibold' : ''}">${p.stock}</td>
                <td class="px-4 py-2 text-right">${p.total_vendido || 0}</td>
                <td class="px-4 py-2 text-right">${formatoGuarani(p.precio)}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error al actualizar inventario:', error);
        mostrarMensaje('Error al actualizar inventario', 'error');
    }
}