const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

router.get('/all-users', 
  verifyToken, 
  authorize(['admin']), 
  userController.getAllUsers
);

// POST /api/users/sync -> Called after Login to save user to MySQL
router.post('/sync', userController.syncUser);
router.post('/login-attempt', userController.recordLoginAttempt);

// GET /api/users/:uid -> Get full profile
router.get('/:uid', userController.getUserProfile);

router.get('/appointment/:id', 
  verifyToken, 
  authorize(['doctor', 'admin']), 
  appointmentController.getMyAppointments
);



// PUT /api/users/:uid -> Update profile
router.put('/:uid', userController.updateUserProfile);

module.exports = router;