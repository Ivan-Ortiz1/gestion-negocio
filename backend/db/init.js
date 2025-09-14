// backend/db/init.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta absoluta al archivo database.sqlite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Tabla productos
    db.run(`CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL NOT NULL,
        stock INTEGER NOT NULL
    )`);

    // Tabla clientes
    db.run(`CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT,
        telefono TEXT
    )`);

    // Tabla ventas
    db.run(`CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        total REAL DEFAULT 0,
        FOREIGN KEY(cliente_id) REFERENCES clientes(id)
    )`);

    // Tabla detalle_ventas
    db.run(`CREATE TABLE IF NOT EXISTS detalle_ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio REAL NOT NULL,
        FOREIGN KEY(venta_id) REFERENCES ventas(id),
        FOREIGN KEY(producto_id) REFERENCES productos(id)
    )`);

    console.log("Tablas creadas o ya existentes");
});

db.close();
