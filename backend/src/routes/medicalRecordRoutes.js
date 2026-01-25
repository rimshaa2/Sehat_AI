const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');

// Route: GET /api/records/:userId
router.get('/:userId', medicalRecordController.getAllByUser);

// Route: POST /api/records/add
router.post('/add', medicalRecordController.create);

module.exports = router;