import { formatoGuarani } from "./utils.js";

async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`Error al obtener datos de ${url}:`, err);
    return null;
  }
}

function renderTableData(tbodySelector, data, formatter) {
  const tbody = document.querySelector(tbodySelector);
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="2" class="border px-2 py-1 text-center text-gray-500">No hay datos disponibles</td>`;
    tbody.appendChild(tr);
    return;
  }

  data.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = formatter(item);
    tbody.appendChild(tr);
  });
}

function renderChart(canvasId, type, labels, values, label, colors = null) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [
        {
          label,
          data: values,
          backgroundColor: colors || "rgba(75, 192, 192, 0.6)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: function (context) {
              return formatoGuarani(context.raw);
            },
          },
        },
      },
    },
  });
}

async function cargarReportes() {
  // Ventas por día
  const ventasDia = await fetchData("http://localhost:3000/api/reportes/ventas-dia");
  renderTableData("#tabla-ventas-dia tbody", ventasDia, (v) => `
    <td class="border px-2 py-1">${v.dia}</td>
    <td class="border px-2 py-1">${formatoGuarani(v.total_dia)}</td>
  `);

  if (ventasDia && ventasDia.length > 0) {
    const labels = ventasDia.map((v) => v.dia);
    const values = ventasDia.map((v) => v.total_dia);
    renderChart("chart-ventas-dia", "bar", labels, values, "Ventas por Día");
  }

  // Ventas por cliente
  const ventasCliente = await fetchData("http://localhost:3000/api/reportes/ventas-cliente");
  renderTableData("#tabla-ventas-cliente tbody", ventasCliente, (v) => `
    <td class="border px-2 py-1">${v.cliente}</td>
    <td class="border px-2 py-1">${formatoGuarani(v.total_cliente)}</td>
  `);

  if (ventasCliente && ventasCliente.length > 0) {
    const labels = ventasCliente.map((v) => v.cliente);
    const values = ventasCliente.map((v) => v.total_cliente);
    renderChart(
      "chart-ventas-cliente",
      "pie",
      labels,
      values,
      "Ventas por Cliente",
      [
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(153, 102, 255, 0.6)",
      ]
    );
  }

  // Productos más vendidos
  const productos = await fetchData("http://localhost:3000/api/reportes/productos-mas-vendidos");
  renderTableData("#tabla-productos tbody", productos, (p) => `
    <td class="border px-2 py-1">${p.producto}</td>
    <td class="border px-2 py-1">${formatoGuarani(p.total_vendido)}</td>
  `);

  if (productos && productos.length > 0) {
    const labels = productos.map((p) => p.producto);
    const values = productos.map((p) => p.total_vendido);
    renderChart("chart-productos", "bar", labels, values, "Productos más vendidos");
  }
}

document.addEventListener("DOMContentLoaded", cargarReportes);
