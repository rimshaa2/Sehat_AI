const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// POST /api/appointments/book -> Book a slot
router.post('/book', appointmentController.bookAppointment);

// GET /api/appointments -> Get history (expects ?userId=1&role=patient)
router.get('/', appointmentController.getMyAppointments);

// PATCH /api/appointments/:id/cancel -> Cancel
router.patch('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;