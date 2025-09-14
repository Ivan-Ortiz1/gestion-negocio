const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// Obtener todos los clientes
function getAll(callback) {
    db.all("SELECT * FROM clientes", [], (err, rows) => {
        callback(err, rows);
    });
}

// Crear un cliente
function create(cliente, callback) {
    const { nombre, correo, telefono } = cliente;
    db.run(
        "INSERT INTO clientes (nombre, correo, telefono) VALUES (?, ?, ?)",
        [nombre, correo, telefono],
        function(err) {
            callback(err, this.lastID);
        }
    );
}

module.exports = { getAll, create };
