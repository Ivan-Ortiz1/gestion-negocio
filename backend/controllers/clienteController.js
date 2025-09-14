const Cliente = require('../models/cliente');

function getAll(req, res) {
    Cliente.getAll((err, clientes) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(clientes);
    });
}

function create(req, res) {
    Cliente.create(req.body, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id });
    });
}

module.exports = { getAll, create };
