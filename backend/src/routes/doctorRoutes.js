const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const adminController = require('../controllers/adminController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

// GET /api/doctors -> Search/List (Supports ?specialization=Cardiologist)
router.get('/', verifyToken, doctorController.getAllDoctors);

router.post('/apply', verifyToken, doctorController.applyForDoctor);
router.get('/dashboard-stats', verifyToken, doctorController.getDashboardStats);

// 2. Check My Status (Used by Frontend to decide what screen to show)
router.get('/status', verifyToken, doctorController.getDoctorStatus);

router.put('/verify/:doctorId', 
  verifyToken, 
  authorize(['admin']), // Only Admins can hit this
  adminController.verifyDoctor
);

router.get('/admin/all', verifyToken, authorize(['admin']), doctorController.getAllDoctorsForAdmin);

// ── Profile ──
router.put('/profile', verifyToken, doctorController.updateDoctorProfile);

// ── My Appointments (Calendar) ──
router.get('/my-appointments', verifyToken, doctorController.getAllMyAppointments);

// ── Availability ──
router.get('/availability', verifyToken, doctorController.getAvailability);
router.put('/availability', verifyToken, doctorController.saveAvailability);

module.exports = router;