const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const { verifyToken, authorize } = require("../middleware/authMiddleware");

// ── Specific routes FIRST (before /:id wildcards) ──────────────────────────

// GET /api/appointments/doctors -> Get doctor list (public)
router.get("/doctors", appointmentController.getDoctors);

// GET /api/appointments/doctors/:doctorId/slots?date=YYYY-MM-DD (public)
router.get("/doctors/:doctorId/slots", appointmentController.getDoctorSlots);

// GET /api/appointments/admin/all (admin only)
router.get(
  "/admin/all",
  verifyToken,
  authorize(["admin"]),
  appointmentController.getAllAppointmentsAdmin
);

// GET /api/appointments -> Get history (?userId=1&role=patient)
router.get("/", verifyToken, appointmentController.getMyAppointments);

// POST /api/appointments/book ✅ verifyToken added — this was causing the 401
router.post("/book", verifyToken, appointmentController.bookAppointment);

// ── Wildcard /:id routes LAST ───────────────────────────────────────────────

// PATCH /api/appointments/:id/status (admin only)
router.patch(
  "/:id/status",
  verifyToken,
  authorize(["admin"]),
  appointmentController.updateAppointmentStatus
);

// PATCH /api/appointments/:id/cancel
router.patch("/:id/cancel", verifyToken, appointmentController.cancelAppointment);

// PATCH /api/appointments/:id/reschedule
router.patch("/:id/reschedule", verifyToken, appointmentController.rescheduleAppointment);

// DELETE /api/appointments/:id (admin only)
router.delete(
  "/:id",
  verifyToken,
  authorize(["admin"]),
  appointmentController.deleteAppointment
);

module.exports = router;