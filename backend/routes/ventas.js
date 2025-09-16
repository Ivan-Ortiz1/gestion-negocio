// backend/routes/ventas.js
const express = require("express");
const router = express.Router();
const ventaController = require("../controllers/ventaController");

// Registrar nueva venta
router.post("/", async (req, res) => {
    try {
        const { clienteId, detalles } = req.body;

        if (!clienteId || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ error: "Datos incompletos" });
        }

        const venta = await ventaController.create({ clienteId, detalles });
        res.json({ message: "Venta registrada con éxito", venta });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener todas las ventas con detalles
router.get("/", async (req, res) => {
    try {
        const ventas = await ventaController.getAll();
        res.json(ventas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
