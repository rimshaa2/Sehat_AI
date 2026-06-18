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

// GET /api/appointments/admin/pending-review
// Returns all appointments where the payment screenshot needs admin review
router.get(
  "/admin/pending-review",
  verifyToken,
  authorize(["admin"]),
  appointmentController.getPendingPaymentReviews
);

// GET /api/appointments -> Get history (?userId=1&role=patient)
router.get("/", verifyToken, appointmentController.getMyAppointments);

// POST /api/appointments/book
router.post("/book", verifyToken, appointmentController.bookAppointment);

// ── Wildcard /:id routes LAST ───────────────────────────────────────────────

// PATCH /api/appointments/:id/status (admin & doctor)
router.patch(
  "/:id/status",
  verifyToken,
  authorize(["admin", "doctor"]),
  appointmentController.updateAppointmentStatus
);

// PATCH /api/appointments/:id/cancel
// Patients, doctors, and admins can all cancel via this route.
// The controller enforces role-based time restrictions.
router.patch("/:id/cancel", verifyToken, appointmentController.cancelAppointment);

// PATCH /api/appointments/:id/reschedule
router.patch("/:id/reschedule", verifyToken, appointmentController.rescheduleAppointment);

// PATCH /api/appointments/:id/review-payment  (admin only)
// Admin approves or rejects a patient's uploaded payment screenshot
router.patch(
  "/:id/review-payment",
  verifyToken,
  authorize(["admin"]),
  appointmentController.reviewPaymentReceipt
);

// DELETE /api/appointments/:id (admin only)
router.delete(
  "/:id",
  verifyToken,
  authorize(["admin"]),
  appointmentController.deleteAppointment
);

module.exports = router;