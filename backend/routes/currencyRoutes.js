const express = require('express');
const router = express.Router();
const { convertCurrency } = require('../controllers/currencyController');
const { protect } = require('../middleware/authMiddleware');

// All currency routes are protected
router.use(protect);

router.get('/convert', convertCurrency);

module.exports = router;