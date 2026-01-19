const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users/sync -> Called after Login to save user to MySQL
router.post('/sync', userController.syncUser);

// GET /api/users/:uid -> Get full profile
router.get('/:uid', userController.getUserProfile);

module.exports = router;