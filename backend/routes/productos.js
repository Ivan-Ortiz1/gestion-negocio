const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conexión a la base de datos
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// Obtener todos los productos
router.get('/', (req, res) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if(err) return res.status(500).json({ success: false, message: err.message });
        res.json(rows);
    });
});

// Crear un nuevo producto
router.post('/', (req, res) => {
    const { nombre, descripcion, precio, stock, codigo_barras } = req.body;

    if (!nombre || precio == null || stock == null) {
        return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
    }

    db.run(
        "INSERT INTO productos (nombre, descripcion, precio, stock, codigo_barras) VALUES (?, ?, ?, ?, ?)",
        [nombre, descripcion, precio, stock, codigo_barras],
        function(err) {
            if(err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Actualizar un producto existente por ID
router.put('/:id', (req, res) => {
    const { nombre, descripcion, precio, stock, codigo_barras } = req.body;

    db.run(
        "UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, codigo_barras=? WHERE id=?",
        [nombre, descripcion, precio, stock, codigo_barras, req.params.id],
        function(err) {
            if(err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

module.exports = router;
