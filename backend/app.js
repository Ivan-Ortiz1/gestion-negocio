// backend/app.js
require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();


// Middlewares globales
app.use(helmet()); // Seguridad en cabeceras HTTP
app.use(morgan("dev")); // Logging de peticiones
app.use(express.json()); // Reemplaza a body-parser
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Habilita req.cookies

// Configuración de CORS (ajusta dominios en producción)
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Rutas con prefijo /api
// Antes: const productosRoutes = require("./routes/productos");
// Ahora cargamos desde services (MVC)

const { verificarToken } = require("./middleware/auth");

const productosRoutes = require("./services/products/routes");
app.use("/api/productos", verificarToken, productosRoutes);

const ventasRoutes = require("./services/sales/routes");
app.use("/api/ventas", verificarToken, ventasRoutes);

const reportesRoutes = require("./routes/reportes");
app.use("/api/reportes", verificarToken, reportesRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const backupRoutes = require("./routes/backup");
app.use("/api/backup", verificarToken, backupRoutes);

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
