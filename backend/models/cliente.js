// backend/models/cliente.js
const { run, all } = require('../db/database');

// Obtener todos los clientes
async function getAll() {
    try {
        const clientes = await all("SELECT * FROM clientes");
        return clientes;
    } catch (err) {
        throw new Error('Error al obtener clientes: ' + err.message);
    }
}

// Crear un cliente
async function create(cliente) {
    try {
        const { nombre, correo, telefono } = cliente;
        const id = await run(
            "INSERT INTO clientes (nombre, correo, telefono) VALUES (?, ?, ?)",
            [nombre, correo, telefono]
        );
        return id;
    } catch (err) {
        throw new Error('Error al crear cliente: ' + err.message);
    }
}

module.exports = { getAll, create };
