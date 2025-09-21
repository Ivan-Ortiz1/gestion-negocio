// backend/routes/ventas.js
const express = require("express");
const { check, validationResult } = require("express-validator");
const ventaController = require("../controllers/ventaController");

const router = express.Router();

/**
 * Middleware para validar las peticiones
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errors: errors.array()
    });
  }
  next();
};

/**
 * @route   POST /api/ventas
 * @desc    Registrar una nueva venta
 */
router.post(
  "/",
  [
    check("cliente_id").isInt({ min: 1 }).withMessage("Cliente inválido"),
    check("detalles").isArray({ min: 1 }).withMessage("Debe enviar al menos un producto"),
    check("detalles.*.producto_id").isInt({ min: 1 }).withMessage("Producto inválido"),
    check("detalles.*.cantidad").isInt({ min: 1 }).withMessage("Cantidad inválida"),
    check("total").isFloat({ min: 0 }).withMessage("Total inválido")
  ],
  validate,
  ventaController.create
);

/**
 * @route   GET /api/ventas
 * @desc    Obtener todas las ventas con detalles
 */
router.get("/", ventaController.getAll);

module.exports = router;
