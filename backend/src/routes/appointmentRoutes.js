const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const { verifyToken, authorize } = require("../middleware/authMiddleware");

// ── Specific routes FIRST (before /:id wildcards) ──────────────────────────

// GET /api/appointments/doctors -> Get doctor list
router.get("/doctors", appointmentController.getDoctors);

// GET /api/appointments/doctors/:doctorId/slots?date=YYYY-MM-DD
router.get("/doctors/:doctorId/slots", appointmentController.getDoctorSlots);

// GET /api/appointments/admin/all
router.get("/admin/all", verifyToken, authorize(["admin"]), appointmentController.getAllAppointmentsAdmin);

// GET /api/appointments -> Get history (?userId=1&role=patient)
router.get("/", appointmentController.getMyAppointments);

// POST /api/appointments/book
router.post("/book", appointmentController.bookAppointment);

// ── Wildcard /:id routes LAST ───────────────────────────────────────────────
router.patch("/:id/status", appointmentController.updateAppointmentStatus);


router.patch("/:id/cancel", appointmentController.cancelAppointment);


router.patch("/:id/reschedule", appointmentController.rescheduleAppointment);






router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;