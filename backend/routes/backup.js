// backend/routes/backup.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ruta para descargar el archivo SQLite actual
router.get('/', (req, res) => {
    const dbPath = path.join(__dirname, '../db/database.sqlite');
    if (!fs.existsSync(dbPath)) {
        return res.status(404).json({ success: false, message: 'No se encontró la base de datos' });
    }
    res.download(dbPath, `backup-${new Date().toISOString().slice(0,10)}.sqlite`);
});

module.exports = router;
