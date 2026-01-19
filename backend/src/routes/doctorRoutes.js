const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// POST /api/doctors -> Create Profile
router.post('/', doctorController.createDoctorProfile);

// GET /api/doctors -> Search/List (Supports ?specialization=Cardiologist)
router.get('/', doctorController.getAllDoctors);

module.exports = router;