const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.getAll);
router.post('/', productoController.create);

module.exports = router;
