const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

// Validation rules for reviewing leave
const reviewValidation = [
  body('action').isIn(['approved', 'rejected']).withMessage('Action must be approved or rejected'),
  body('comment').optional().trim()
];

// Routes (all require manager or admin role)
router.get('/pending', auth, requireRole(['manager', 'admin']), adminController.getPendingRequests);
router.put('/review/:id', auth, requireRole(['manager', 'admin']), reviewValidation, adminController.reviewRequest);
router.get('/team', auth, requireRole(['manager', 'admin']), adminController.getTeam);

module.exports = router;
