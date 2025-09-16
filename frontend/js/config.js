// frontend/js/config.js

// Detecta si estás en desarrollo o producción
const isDev = window.location.hostname === "localhost";

const CONFIG = {
  API_BASE_URL: isDev 
    ? "http://localhost:3000/api"   // Desarrollo
    : "https://tu-dominio.com/api", // Producción
};

export default CONFIG;
