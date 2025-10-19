// backend/utils/logger.js
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs/operaciones.log');

function logOperacion(tipo, mensaje, datos = {}) {
    const fecha = new Date().toISOString();
    const logEntry = {
        fecha,
        tipo,
        mensaje,
        datos
    };
    const logString = JSON.stringify(logEntry) + '\n';
    fs.appendFile(logFile, logString, err => {
        if (err) console.error('Error al escribir log:', err);
    });
    console.log(`[LOG][${tipo}] ${fecha} - ${mensaje}`, datos);
}

module.exports = { logOperacion };
