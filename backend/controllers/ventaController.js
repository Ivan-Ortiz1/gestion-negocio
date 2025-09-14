const Venta = require('../models/venta');

function getAll(req, res) {
    Venta.getAll((err, ventas) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(ventas);
    });
}

function create(req, res) {
    Venta.create(req.body, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id });
    });
}

module.exports = { getAll, create };
