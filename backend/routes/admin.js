// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Conexión a la base de datos
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// Ruta de login
router.post('/login', (req, res) => {
    const { usuario, contrasena } = req.body;

    db.get("SELECT * FROM administradores WHERE usuario = ?", [usuario], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            const match = await bcrypt.compare(contrasena, row.contrasena);
            if (match) {
                res.json({ success: true, usuario: row.usuario });
            } else {
                res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
    });
});

// Ruta para registrar nuevos administradores
router.post('/registrar-admin', async (req, res) => {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    try {
        const hash = await bcrypt.hash(contrasena, 10); // Generar hash seguro
        db.run("INSERT INTO administradores (usuario, contrasena) VALUES (?, ?)", [usuario, hash], function(err) {
            if (err) {
                if (err.message.includes("UNIQUE")) {
                    return res.status(400).json({ success: false, message: 'El usuario ya existe' });
                }
                return res.status(500).json({ success: false, message: err.message });
            }
            res.json({ success: true, message: 'Administrador registrado correctamente', id: this.lastID });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
