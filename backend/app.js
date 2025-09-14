// backend/app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos
const dbPath = path.join(__dirname, "db", "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Error al conectar con la base de datos:", err.message);
    else console.log("Conectado a la base de datos SQLite");
});

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

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
