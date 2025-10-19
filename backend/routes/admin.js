// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { run, get } = require('../db/database');
const { verificarToken } = require('../middleware/auth');

// Ruta de login
router.post('/login', async (req, res) => {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    try {
        const row = await get("SELECT * FROM administradores WHERE usuario = ?", [usuario]);
        if (!row) {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
        const match = await bcrypt.compare(contrasena, row.contrasena);
        if (match) {
            // Generar JWT
            const token = jwt.sign({ usuario: row.usuario, id: row.id }, process.env.JWT_SECRET || 'clave_demo', { expiresIn: '2h' });
            // Enviar cookie segura
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development' ? true : false,
                sameSite: process.env.NODE_ENV !== 'development' ? 'strict' : 'lax',
                maxAge: 2 * 60 * 60 * 1000 // 2 horas
            });
            return res.json({ success: true, message: 'Login exitoso', usuario: row.usuario });
        } else {
            res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
    } catch (err) {
        console.error('Error en login de administrador:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Ruta para registrar nuevos administradores
router.post('/registrar-admin', verificarToken, async (req, res) => {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    try {
        const hash = await bcrypt.hash(contrasena, 10); // Generar hash seguro
        const id = await run("INSERT INTO administradores (usuario, contrasena) VALUES (?, ?)", [usuario, hash]);
        res.json({ success: true, message: 'Administrador registrado correctamente', id });
    } catch (err) {
        if (err.message.includes("UNIQUE")) {
            res.status(400).json({ success: false, message: 'El usuario ya existe' });
        } else {
            console.error('Error al registrar administrador:', err);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    }
});

module.exports = router;
