// backend/db/init.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

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
        stock INTEGER NOT NULL,
        codigo_barras TEXT UNIQUE
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

    // Tabla detalles_venta
    db.run(`CREATE TABLE IF NOT EXISTS detalles_venta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio REAL NOT NULL,
        FOREIGN KEY(venta_id) REFERENCES ventas(id),
        FOREIGN KEY(producto_id) REFERENCES productos(id)
    )`);

    // Tabla administradores
    db.run(`CREATE TABLE IF NOT EXISTS administradores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE,
        contrasena TEXT
    )`);

    // Insertar administrador inicial si no existe (con hash)
    db.get("SELECT * FROM administradores WHERE usuario = 'admin'", async (err, row) => {
        if(err) {
            console.error("Error al verificar administrador inicial:", err.message);
            db.close();
            return;
        }
        if(!row){
            const hash = await bcrypt.hash('admin123', 10); // 10 rondas de sal
            db.run("INSERT INTO administradores (usuario, contrasena) VALUES (?, ?)", ['admin', hash], (err) => {
                if(err) console.error("Error al crear admin inicial:", err.message);
                else console.log("Administrador inicial creado: admin / admin123 (hashed)");
                db.close();
            });
        } else {
            db.close();
        }
    });

    console.log("Tablas creadas o ya existentes");
});
