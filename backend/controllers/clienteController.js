const Cliente = require('../models/cliente');

// Obtener todos los clientes
async function getAll(req, res) {
    try {
        const clientes = await Cliente.getAll();
        res.json(clientes);
    } catch (err) {
        console.error('Error al obtener clientes:', err);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
}

// Crear un nuevo cliente
async function create(req, res) {
    try {
        const { nombre, correo, telefono } = req.body;

        if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }
        if (!correo || !correo.match(/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/)) {
            return res.status(400).json({ error: "Correo electrónico inválido" });
        }
        if (telefono && !telefono.match(/^\d{6,}$/)) {
            return res.status(400).json({ error: "Teléfono inválido" });
        }

        const id = await Cliente.create({ nombre, correo, telefono });
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error al crear cliente:', err);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
}

// Actualizar cliente
async function update(req, res) {
    try {
        const { nombre, correo, telefono } = req.body;
        const id = req.params.id;

        if (!nombre || !correo) {
            return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
        }

        await Cliente.update(id, { nombre, correo, telefono });
        res.json({ success: true });
    } catch (err) {
        console.error('Error al actualizar cliente:', err);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
}

// Eliminar cliente
async function remove(req, res) {
    try {
        const id = req.params.id;
        await Cliente.remove(id);
        res.json({ success: true });
    } catch (err) {
        console.error('Error al eliminar cliente:', err);
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
}

module.exports = { getAll, create, update, remove };
