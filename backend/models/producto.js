const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

function getAll(callback) {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        callback(err, rows);
    });
}

function create(producto, callback) {
    const { nombre, descripcion, precio, stock } = producto;
    db.run(
        "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)",
        [nombre, descripcion, precio, stock],
        function(err) {
            callback(err, this.lastID);
        }
    );
}

module.exports = { getAll, create };
