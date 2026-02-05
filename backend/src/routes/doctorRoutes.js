const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const adminController = require('../controllers/adminController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

// GET /api/doctors -> Search/List (Supports ?specialization=Cardiologist)
router.get('/', verifyToken, doctorController.getAllDoctors);

router.post('/apply', verifyToken, doctorController.applyForDoctor);

// 2. Check My Status (Used by Frontend to decide what screen to show)
router.get('/status', verifyToken, doctorController.getDoctorStatus);

router.put('/verify/:doctorId', 
  verifyToken, 
  authorize(['admin']), // Only Admins can hit this
  adminController.verifyDoctor
);
module.exports = router;