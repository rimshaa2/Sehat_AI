// ─── src/controllers/appointmentController.js ────────────────────────────────
const { Appointment, Doctor, User, sequelize } = require("../models");
const { redisClient } = require("../config/database");
const { sendPatientConfirmation, sendDoctorNotification } = require('../services/emailService');
const {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
} = require('../services/notificationService');
const { Op } = require('sequelize');

// ── Config ────────────────────────────────────────────────────────────────────
const PATIENT_CANCEL_HOURS_BEFORE = 24;

const getAuthenticatedDbUser = async (req) => {
  if (req.dbUser) return req.dbUser;
  if (!req.user?.uid) return null;
  return User.findOne({ where: { firebase_uid: req.user.uid } });
};

// ── Helper: get Doctor table PK from User table PK ───────────────────────────
// appt.doctorId = Doctor.id  (Doctor table primary key)
// dbUser.id     = User.id    (User table primary key)
// These are DIFFERENT — always resolve before comparing.
const getDoctorRecordId = async (userId) => {
  const doc = await Doctor.findOne({ where: { userId } });
  return doc ? doc.id : null;
};

// ── Helper: build cancellationDeadline from date + timeSlot ──────────────────
function buildCancellationDeadline(appointmentDate, timeSlot) {
  try {
    const [timePart, meridiem] = timeSlot.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    const apptStart = new Date(`${appointmentDate}T${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:00`);
    const deadline  = new Date(apptStart.getTime() - PATIENT_CANCEL_HOURS_BEFORE * 60 * 60 * 1000);
    return deadline;
  } catch {
    return null;
  }
}

// 1. Book an Appointment
exports.bookAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) { await t.rollback(); return res.status(401).json({ error: "Unauthorized user" }); }

    const { patientId, doctorId, appointmentDate, timeSlot, reason, amount,
            paymentMethod = "cash", paymentStatus = "pending", receiptImage } = req.body;

    if (dbUser.role === "patient" && Number(patientId) !== Number(dbUser.id)) {
      await t.rollback();
      return res.status(403).json({ error: "Patients can only book appointments for themselves." });
    }

    const existing = await Appointment.findOne({ where: { doctorId, appointmentDate, timeSlot }, transaction: t });
    if (existing) { await t.rollback(); return res.status(409).json({ error: "Slot already booked. Please choose another." }); }

    let paymentReviewStatus = "not_required";
    if (paymentMethod === "bank" && receiptImage) paymentReviewStatus = "pending_review";

    const cancellationDeadline = buildCancellationDeadline(appointmentDate, timeSlot);

    const newAppointment = await Appointment.create(
      { patientId, doctorId, appointmentDate, timeSlot, reason, amount,
        status: "scheduled", paymentMethod, paymentStatus, receiptImage,
        paymentReviewStatus, cancellationDeadline },
      { transaction: t }
    );
    await t.commit();

    let doctorRecord = null;
    try {
      doctorRecord = await Doctor.findOne({ where: { id: doctorId }, include: [{ model: User, as: 'user', attributes: ['fullName'] }] });
      await sendAppointmentConfirmation(dbUser, newAppointment, { name: doctorRecord?.user?.fullName || 'your doctor' });
    } catch (fcmErr) { console.warn('FCM confirmation error (non-fatal):', fcmErr.message); }

    const io = req.app.get("io");
    if (io && doctorRecord?.userId) {
      io.to(`user_${doctorRecord.userId}`).emit("NEW_NOTIFICATION", { type: "NEW_APPOINTMENT", message: `New appointment booked by patient`, appointmentId: newAppointment.id });
    }
    if (paymentReviewStatus === "pending_review" && io) {
      io.to("admin_room").emit("PAYMENT_REVIEW_NEEDED", { appointmentId: newAppointment.id, patientId, doctorId, amount });
    }

    res.status(201).json({
      success: true, appointment: newAppointment, paymentMethod, paymentReviewStatus,
      message: paymentReviewStatus === "pending_review"
        ? "Appointment booked. Your payment receipt is under review by admin."
        : "Appointment booked successfully.",
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Get My Appointments (Role Aware)
exports.getMyAppointments = async (req, res) => {
  try {
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });
    const { userId, role } = req.query;
    const whereClause = {};
    const requestedId = Number(userId);

    if (dbUser.role === "admin") {
      if (role === "patient")     whereClause.patientId = requestedId;
      else if (role === "doctor") whereClause.doctorId  = requestedId;
    } else if (dbUser.role === "doctor") {
      // FIX: use Doctor table ID, not User table ID
      const doctorRecordId = await getDoctorRecordId(dbUser.id);
      whereClause.doctorId = doctorRecordId;
    } else {
      whereClause.patientId = dbUser.id;
      whereClause.paymentReviewStatus = { [Op.notIn]: ['pending_review'] };
    }

    const resolvedRole = dbUser.role === "admin" ? role || "patient" : dbUser.role === "doctor" ? "doctor" : "patient";
    const include = [];

    if (resolvedRole === "patient") {
      include.push({ model: Doctor, as: "doctor", include: [{ model: User, as: "user", attributes: ["fullName", "email"] }] });
    } else {
      include.push({ model: User, as: "patient", attributes: ["fullName","email","phoneNumber","gender","dateOfBirth","weight","height","bloodType","medicalHistory","allergies","emergencyContact"] });
    }

    const appointments = await Appointment.findAll({ where: whereClause, include, order: [["appointmentDate", "ASC"]] });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2.2 Get All Appointments (Admin)
exports.getAllAppointmentsAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: User,   as: "patient", attributes: ["fullName", "phoneNumber"] },
        { model: Doctor, as: "doctor",  include: [{ model: User, as: "user", attributes: ["fullName"] }] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = appointments.map((apt) => ({
      id:                   apt.id,
      patientName:          apt.patient?.fullName        || "Guest Patient",
      patientPhone:         apt.patient?.phoneNumber     || "N/A",
      doctorName:           apt.doctor?.user?.fullName   || "Unassigned",
      specialization:       apt.doctor?.specialization   || "",
      date:                 new Date(apt.appointmentDate).toLocaleDateString(),
      rawDate:              apt.appointmentDate instanceof Date ? apt.appointmentDate.toISOString().split("T")[0] : apt.appointmentDate,
      time:                 apt.timeSlot                 || "N/A",
      type:                 apt.reason                   || "General Checkup",
      location:             apt.meetingLink              || "In-Clinic",
      status:               apt.status,
      paymentMethod:        apt.paymentMethod,
      paymentStatus:        apt.paymentStatus,
      paymentReviewStatus:  apt.paymentReviewStatus,
      paymentReviewNote:    apt.paymentReviewNote,
      receiptImage:         apt.receiptImage,
      cancellationDeadline: apt.cancellationDeadline,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Fetch Appointments Error:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

// 2.5 Update Appointment Status (admin + doctor)
// FIX: resolve Doctor table ID from User ID
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const appt = await Appointment.findByPk(id);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    const dbUser = await getAuthenticatedDbUser(req);
    const doctorRecordId = dbUser.role === "doctor" ? await getDoctorRecordId(dbUser.id) : null;
    const isAuthorized   = dbUser.role === "admin" || doctorRecordId === appt.doctorId;

    if (!isAuthorized) return res.status(403).json({ error: "You are not authorized to update this appointment." });

    if (status)        appt.status        = status;
    if (paymentStatus) appt.paymentStatus = paymentStatus;
    await appt.save();

    res.json({ success: true, message: `Appointment status updated`, appointment: appt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2.6 Admin reviews uploaded payment receipt
// PATCH /api/appointments/:id/review-payment
exports.reviewPaymentReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;

    if (!["approve", "reject"].includes(action)) return res.status(400).json({ error: "action must be 'approve' or 'reject'" });

    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser || dbUser.role !== "admin") return res.status(403).json({ error: "Only admin can review payment receipts." });

    const appt = await Appointment.findByPk(id, { include: [{ model: User, as: "patient" }] });
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    if (appt.paymentReviewStatus !== "pending_review") {
      return res.status(400).json({ error: `Receipt is already ${appt.paymentReviewStatus}. Nothing to review.` });
    }

    const io = req.app.get("io");

    if (action === "approve") {
      appt.paymentReviewStatus = "approved";
      appt.paymentStatus       = "completed";
      appt.paymentReviewNote   = note || null;
      await appt.save();

      if (io) io.to(`user_${appt.patientId}`).emit("PAYMENT_REVIEW_UPDATE", { appointmentId: appt.id, paymentReviewStatus: "approved", note: null });

      try {
        if (appt.patient?.fcmToken) {
          const { sendPushNotification } = require('../services/notificationService');
          await sendPushNotification(appt.patient.fcmToken, "Payment Confirmed ✅", "Your payment receipt has been approved. Your appointment is confirmed.");
        }
      } catch (fcmErr) { console.warn("FCM approve notification error (non-fatal):", fcmErr.message); }

      return res.json({ success: true, message: "Receipt approved successfully.", appointment: appt });

    } else {
      // Reject → delete so slot is freed
      const patientId = appt.patientId;
      const aptId     = appt.id;
      await appt.destroy();

      if (io) io.to(`user_${patientId}`).emit("PAYMENT_REVIEW_UPDATE", { appointmentId: aptId, paymentReviewStatus: "rejected", note: note || "Your payment receipt was rejected. Please book again." });

      try {
        const patient = await User.findByPk(patientId);
        if (patient?.fcmToken) {
          const { sendPushNotification } = require('../services/notificationService');
          await sendPushNotification(patient.fcmToken, "Payment Rejected ❌", note || "Your payment receipt was rejected. Please book again with a valid receipt.");
        }
      } catch (fcmErr) { console.warn("FCM reject notification error (non-fatal):", fcmErr.message); }

      return res.json({ success: true, message: "Receipt rejected. Appointment deleted and slot freed." });
    }
  } catch (error) {
    console.error("Review Payment Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2.7 Get all appointments pending payment review (admin)
// GET /api/appointments/admin/pending-review
exports.getPendingPaymentReviews = async (req, res) => {
  try {
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser || dbUser.role !== "admin") return res.status(403).json({ error: "Admin access only." });

    const appointments = await Appointment.findAll({
      where: { paymentReviewStatus: "pending_review" },
      include: [
        { model: User,   as: "patient", attributes: ["fullName", "phoneNumber", "email"] },
        { model: Doctor, as: "doctor",  include: [{ model: User, as: "user", attributes: ["fullName"] }] },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Cancel Appointment
// Rules: Admin → always | Doctor → always (own appts) | Patient → not same day, within 24hrs
// FIX: resolve Doctor table ID from User ID
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });

    const appt = await Appointment.findByPk(id);
    if (!appt)                       return res.status(404).json({ error: "Appointment not found" });
    if (appt.status === "cancelled") return res.status(400).json({ error: "Appointment is already cancelled." });
    if (appt.status === "completed") return res.status(400).json({ error: "Completed appointments cannot be cancelled." });

    // Resolve Doctor table ID from User ID
    const doctorRecordId = dbUser.role === "doctor" ? await getDoctorRecordId(dbUser.id) : null;
    const isAdmin   = dbUser.role === "admin";
    const isDoctor  = doctorRecordId === appt.doctorId;
    const isPatient = dbUser.id === appt.patientId;

    if (!isAdmin && !isDoctor && !isPatient) {
      return res.status(403).json({ error: "You are not allowed to cancel this appointment." });
    }

    // Patient cancellation window
    if (isPatient && !isAdmin) {
      const now      = new Date();
      const todayPKT = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
      const apptDate = appt.appointmentDate instanceof Date
        ? appt.appointmentDate.toISOString().split("T")[0]
        : String(appt.appointmentDate);

      if (apptDate === todayPKT) {
        return res.status(400).json({ error: "You cannot cancel an appointment on the day it is scheduled. Please contact the clinic directly." });
      }
      if (appt.cancellationDeadline && now > new Date(appt.cancellationDeadline)) {
        return res.status(400).json({
          error: `Cancellation window has passed. Appointments must be cancelled at least ${PATIENT_CANCEL_HOURS_BEFORE} hours in advance.`,
          cancellationDeadline: appt.cancellationDeadline,
        });
      }
    }

    appt.status = "cancelled";
    await appt.save();

    // FCM: notify patient if cancelled by doctor/admin
    if (!isPatient) {
      try {
        const patient = await User.findByPk(appt.patientId);
        if (patient?.fcmToken) await sendAppointmentCancellation(patient, appt);
      } catch (fcmErr) { console.warn('FCM patient cancel notification error (non-fatal):', fcmErr.message); }
    }

    // FCM: notify doctor if cancelled by patient/admin
    if (!isDoctor) {
      try {
        const doctorRecord = await Doctor.findOne({ where: { id: appt.doctorId }, include: [{ model: User, as: 'user', attributes: ['fcmToken'] }] });
        if (doctorRecord?.user?.fcmToken) {
          const { sendPushNotification } = require('../services/notificationService');
          await sendPushNotification(doctorRecord.user.fcmToken, "Appointment Cancelled", `An appointment on ${appt.appointmentDate} at ${appt.timeSlot} has been cancelled.`);
        }
      } catch (fcmErr) { console.warn('FCM doctor cancel notification error (non-fatal):', fcmErr.message); }
    }

    // Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${appt.patientId}`).emit("APPOINTMENT_CANCELLED", { appointmentId: appt.id, cancelledBy: dbUser.role });
      io.to(`user_${appt.doctorId}`).emit("APPOINTMENT_CANCELLED",  { appointmentId: appt.id, cancelledBy: dbUser.role });
    }

    res.json({ success: true, message: "Appointment cancelled", cancelledBy: dbUser.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3.1 Delete Appointment (admin only)
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appt   = await Appointment.findByPk(id);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });
    await appt.destroy();
    res.json({ success: true, message: "Appointment deleted completely" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3.5 Reschedule Appointment
// FIX: resolve Doctor table ID from User ID
exports.rescheduleAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { appointmentDate, timeSlot } = req.body;
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) { await t.rollback(); return res.status(401).json({ error: "Unauthorized user" }); }

    const appt = await Appointment.findByPk(id, { transaction: t });
    if (!appt) { await t.rollback(); return res.status(404).json({ error: "Appointment not found" }); }

    const doctorRecordId = dbUser.role === "doctor" ? await getDoctorRecordId(dbUser.id) : null;
    const isDoctor = doctorRecordId === appt.doctorId;

    if (dbUser.role !== "admin" && dbUser.id !== appt.patientId && !isDoctor) {
      await t.rollback();
      return res.status(403).json({ error: "You are not allowed to reschedule this appointment." });
    }

    const existing = await Appointment.findOne({ where: { doctorId: appt.doctorId, appointmentDate, timeSlot, status: "scheduled" }, transaction: t });
    if (existing && existing.id !== appt.id) { await t.rollback(); return res.status(409).json({ error: "This slot is already booked for the selected doctor." }); }

    appt.appointmentDate      = appointmentDate;
    appt.timeSlot             = timeSlot;
    appt.status               = "scheduled";
    appt.cancellationDeadline = buildCancellationDeadline(appointmentDate, timeSlot);
    await appt.save({ transaction: t });
    await t.commit();

    res.json({ success: true, message: "Appointment rescheduled successfully", appointment: appt });
  } catch (error) {
    await t.rollback();
    console.error("Reschedule Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 4. Browse Available Doctors
exports.getDoctors = async (req, res) => {
  const { specialty } = req.query;
  try {
    const doctors = await Doctor.findAll({
      where:   specialty ? { specialization: specialty } : {},
      include: [{ model: User, as: "user", attributes: ["fullName"] }],
    });
    res.json(doctors);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 5. Get Available Slots for a Doctor on a Date
exports.getDoctorSlots = async (req, res) => {
  const doctorId = parseInt(req.params.doctorId);
  const { date } = req.query;

  try {
    const [year, month, day] = date.split("-").map(Number);
    const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dayOfWeek = DAY_NAMES[new Date(year, month - 1, day).getDay()];

    const { Availability } = require("../models");
    const availability = await Availability.findOne({ where: { doctorId, dayOfWeek, isAvailable: true } });

    console.log(`Slots → doctorId=${doctorId} date=${date} dayOfWeek=${dayOfWeek} → ${availability ? `YES (${availability.startTime}-${availability.endTime})` : "NO"}`);

    if (!availability) return res.json({ date, availableSlots: [] });

    const startHour = parseInt(availability.startTime.split(":")[0]);
    const startMin  = parseInt(availability.startTime.split(":")[1]);
    const endHour   = parseInt(availability.endTime.split(":")[0]);
    const endMin    = parseInt(availability.endTime.split(":")[1]);

    const slots = [];
    let currentHour = startHour;
    let currentMin  = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const ampm        = currentHour >= 12 ? "PM" : "AM";
      const displayHour = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;
      slots.push(`${String(displayHour).padStart(2,"0")}:${String(currentMin).padStart(2,"0")} ${ampm}`);
      currentMin += 30;
      if (currentMin >= 60) { currentHour += 1; currentMin = 0; }
    }

    const existingBookings = await Appointment.findAll({ where: { doctorId, appointmentDate: date, status: "scheduled" } });
    const bookedTimes = existingBookings.map((a) => a.timeSlot);
    const validSlots  = slots.filter((time) => !bookedTimes.includes(time));

    res.json({ date, availableSlots: validSlots });
  } catch (error) {
    console.error("Get Slots Error:", error);
    res.status(500).json({ error: error.message });
  }
};