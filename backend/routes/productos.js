// backend/routes/productos.js
const express = require("express");
const { check, validationResult } = require("express-validator");
const productoController = require("../controllers/productoController");

const router = express.Router();

/**
 * Middleware para manejar validaciones
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
 * @route   GET /api/productos
 * @desc    Obtener todos los productos
 */
router.get("/", productoController.getAll);

/**
 * @route   POST /api/productos
 * @desc    Crear un nuevo producto
 */
router.post(
  "/",
  [
    check("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    check("precio")
      .isNumeric()
      .withMessage("El precio debe ser un número válido"),
    check("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("El stock debe ser un número entero positivo")
  ],
  validate,
  productoController.create
);

/**
 * @route   PUT /api/productos/:id
 * @desc    Actualizar un producto existente
 */
router.put(
  "/:id",
  [
    check("nombre").optional().notEmpty().withMessage("El nombre no puede estar vacío"),
    check("precio").optional().isNumeric().withMessage("El precio debe ser un número válido"),
    check("stock").optional().isInt({ min: 0 }).withMessage("El stock debe ser un número entero positivo")
  ],
  validate,
  productoController.update
);

/**
 * @route   DELETE /api/productos/:id
 * @desc    Eliminar un producto por ID
 */
router.delete("/:id", productoController.remove);

module.exports = router;
