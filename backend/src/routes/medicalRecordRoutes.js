const express = require('express');
const router  = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { verifyToken } = require('../middleware/authMiddleware');

// ── Public-ish (userId from params, guarded by verifyToken) ──────────────────

// GET  /api/records/:userId         — list ALL records (manual + auto-aggregated)
router.get('/:userId', verifyToken, medicalRecordController.getAllByUser);

// ── Manual record CRUD ───────────────────────────────────────────────────────

// POST /api/records/add             — create a manual record
router.post('/add', verifyToken, medicalRecordController.create);

// GET  /api/records/record/:recordId — get a single manual record by PK
router.get('/record/:recordId', verifyToken, medicalRecordController.getOne);

// PUT  /api/records/:recordId       — update a manual record
router.put('/:recordId', verifyToken, medicalRecordController.update);

// DELETE /api/records/:recordId     — delete a manual record
router.delete('/:recordId', verifyToken, medicalRecordController.delete);

module.exports = router;