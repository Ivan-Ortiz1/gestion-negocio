// backend/app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Error interno del servidor" });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
