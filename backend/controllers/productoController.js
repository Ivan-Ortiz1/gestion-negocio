const Producto = require('../models/producto');

function getAll(req, res) {
    Producto.getAll((err, productos) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(productos);
    });
}

function create(req, res) {
    Producto.create(req.body, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id });
    });
}

module.exports = { getAll, create };
