// backend/routes/clientes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Middleware para validar ID numérico en rutas con :id
router.param('id', (req, res, next, id) => {
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: 'ID inválido, debe ser un número' });
    }
    next();
});

// Rutas de clientes
router.get('/', clienteController.getAll);
router.post('/', clienteController.create);
router.put('/:id', clienteController.update);
router.delete('/:id', clienteController.remove);

module.exports = router;
