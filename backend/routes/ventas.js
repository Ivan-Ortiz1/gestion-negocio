// backend/routes/ventas.js
const express = require("express");
const { check, validationResult } = require("express-validator");
const ventaController = require("../controllers/ventaController");

const router = express.Router();

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

router.post(
  "/",
  [
    // cliente_id eliminado
    check("productos").isArray({ min: 1 }).withMessage("Debe enviar al menos un producto"),
    check("productos.*.producto_id").isInt({ min: 1 }).withMessage("Producto inválido"),
    check("productos.*.cantidad").isInt({ min: 1 }).withMessage("Cantidad inválida"),
    check("total").optional().isFloat({ min: 0 }).withMessage("Total inválido")
  ],
  validate,
  ventaController.create
);

router.get("/", ventaController.getAll);

module.exports = router;
