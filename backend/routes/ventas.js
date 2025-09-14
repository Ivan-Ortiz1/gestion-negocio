const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.get('/', ventaController.getAll);
router.post('/', ventaController.create);

module.exports = router;
