const express = require('express');
const calendarController = require('../controllers/calendarController');
const auth = require('../middleware/auth');

const router = express.Router();

// Routes
router.get('/', auth, calendarController.getCalendar);

module.exports = router;
