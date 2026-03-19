const express = require('express');
const balanceController = require('../controllers/balanceController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

// Routes
router.get('/', auth, balanceController.getBalances);
router.get('/:userId', auth, requireRole(['manager', 'admin']), balanceController.getUserBalances);

module.exports = router;
