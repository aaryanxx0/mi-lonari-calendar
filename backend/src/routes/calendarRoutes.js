const express = require('express');
const calendarController = require('../controllers/calendarController');
const { authenticate, checkProfileComplete } = require('../middleware/auth');

const router = express.Router();

router.get('/meta', authenticate, checkProfileComplete, calendarController.getCalendarMetadata);
router.get('/', authenticate, checkProfileComplete, calendarController.getCalendarDays);
router.get('/:date', authenticate, checkProfileComplete, calendarController.getCalendarDay);

module.exports = router;
