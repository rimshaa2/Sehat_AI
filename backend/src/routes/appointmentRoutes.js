const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const { verifyToken, authorize } = require("../middleware/authMiddleware");

// POST /api/appointments/book -> Book a slot
router.post("/book", appointmentController.bookAppointment);

// GET /api/appointments -> Get history (expects ?userId=1&role=patient)
router.get("/", appointmentController.getMyAppointments);
router.get(
  "/admin/all",
  verifyToken,
  authorize(["admin"]),
  appointmentController.getAllAppointmentsAdmin,
);

// PATCH /api/appointments/:id/cancel -> Cancel
router.patch("/:id/cancel", appointmentController.cancelAppointment);

router.get("/doctors", appointmentController.getDoctors);
router.get("/doctors/:doctorId/slots", appointmentController.getDoctorSlots);

module.exports = router;
