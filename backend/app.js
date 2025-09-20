// backend/app.js
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

// Middlewares globales
app.use(helmet()); // Seguridad en cabeceras HTTP
app.use(morgan("dev")); // Logging de peticiones
app.use(express.json()); // Reemplaza a body-parser
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS (ajusta dominios en producción)
app.use(cors({
    origin: ["http://localhost:5173"], // Ajusta según tu frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Rutas con prefijo /api
const productosRoutes = require("./routes/productos");
app.use("/api/productos", productosRoutes);

const clientesRoutes = require("./routes/clientes");
app.use("/api/clientes", clientesRoutes);

const ventasRoutes = require("./routes/ventas");
app.use("/api/ventas", ventasRoutes);

const reportesRoutes = require("./routes/reportes");
app.use("/api/reportes", reportesRoutes);

// Rutas de administradores (login y registro)
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

// Ruta base para verificar estado de la API
app.get("/api", (req, res) => {
    res.json({ success: true, message: "API funcionando correctamente 🚀" });
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Ruta no encontrada",
        data: null
    });
});

// Manejo global de errores (500)
app.use((err, req, res, next) => {
    console.error("Error interno:", err.stack);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        data: null
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
