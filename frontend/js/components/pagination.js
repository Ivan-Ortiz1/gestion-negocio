// frontend/js/components/pagination.js

export function createPagination(container, pagination, onPageChange) {
    if (!container) return;

    const { total, page, totalPages } = pagination;
    
    // Crear el elemento de paginación
    const paginationElement = document.createElement('div');
    paginationElement.className = 'flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4';
    
    // Información de resultados
    const infoElement = document.createElement('div');
    infoElement.className = 'flex flex-1 justify-between sm:hidden';
    infoElement.innerHTML = `
        <p class="text-sm text-gray-700">
            Mostrando página ${page} de ${totalPages}
        </p>
    `;
    
    // Botones de navegación
    const navigationElement = document.createElement('div');
    navigationElement.className = 'flex flex-1 justify-between sm:justify-end gap-2';
    
    // Botón anterior
    const prevButton = document.createElement('button');
    prevButton.className = `relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
        page <= 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
    } ring-1 ring-inset ring-gray-300 rounded-md`;
    prevButton.innerHTML = 'Anterior';
    prevButton.disabled = page <= 1;
    prevButton.onclick = () => page > 1 && onPageChange(page - 1);
    
    // Botón siguiente
    const nextButton = document.createElement('button');
    nextButton.className = `relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
        page >= totalPages 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
    } ring-1 ring-inset ring-gray-300 rounded-md`;
    nextButton.innerHTML = 'Siguiente';
    nextButton.disabled = page >= totalPages;
    nextButton.onclick = () => page < totalPages && onPageChange(page + 1);
    
    // Agregar botones al elemento de navegación
    navigationElement.appendChild(prevButton);
    navigationElement.appendChild(nextButton);
    
    // Limpiar y agregar elementos al contenedor
    container.innerHTML = '';
    container.appendChild(infoElement);
    container.appendChild(navigationElement);
}