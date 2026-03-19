const express = require('express');
const { body } = require('express-validator');
const leaveController = require('../controllers/leaveController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules for creating leave
const createLeaveValidation = [
  body('leaveTypeId').isInt().withMessage('Valid leave type is required'),
  body('startDate').isDate().withMessage('Valid start date is required'),
  body('endDate').isDate().withMessage('Valid end date is required'),
  body('reason').trim().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters')
];

// Routes
router.get('/', auth, leaveController.getLeaves);
router.post('/', auth, createLeaveValidation, leaveController.createLeave);
router.get('/:id', auth, leaveController.getLeaveById);
router.put('/:id/cancel', auth, leaveController.cancelLeave);

module.exports = router;
