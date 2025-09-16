// backend/routes/ventas.js
const express = require("express");
const router = express.Router();
const ventaController = require("../controllers/ventaController");

// Registrar nueva venta
router.post("/", ventaController.create);

// Obtener todas las ventas con detalles
router.get("/", ventaController.getAll);

module.exports = router;
