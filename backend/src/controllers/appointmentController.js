// ─── src/controllers/appointmentController.js ────────────────────────────────
// MODIFIED: Added FCM push notification on bookAppointment (confirmation)
// and cancelAppointment (cancellation notice to patient).
// New lines are marked with ← FCM
// ─────────────────────────────────────────────────────────────────────────────

const { Appointment, Doctor, User, sequelize } = require("../models");
const { redisClient } = require("../config/database");
const { sendPatientConfirmation, sendDoctorNotification } = require('../services/emailService');
const {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
} = require('../services/notificationService'); // ← FCM

const getAuthenticatedDbUser = async (req) => {
  if (req.dbUser) return req.dbUser;
  if (!req.user?.uid) return null;
  return User.findOne({ where: { firebase_uid: req.user.uid } });
};

// 1. Book an Appointment
exports.bookAppointment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) {
      await t.rollback();
      return res.status(401).json({ error: "Unauthorized user" });
    }

    const {
      patientId,
      doctorId,
      appointmentDate,
      timeSlot,
      reason,
      amount,
      paymentMethod  = "cash",
      paymentStatus  = "pending",
      receiptImage,
    } = req.body;

    const normalizedPatientId = Number(patientId);
    const requesterId         = Number(dbUser.id);

    if (dbUser.role === "patient" && normalizedPatientId !== requesterId) {
      await t.rollback();
      return res.status(403).json({ error: "Patients can only book appointments for themselves." });
    }

    // A. Double-Booking Check
    const existing = await Appointment.findOne({
      where: { doctorId, appointmentDate, timeSlot },
      transaction: t,
    });

    if (existing) {
      await t.rollback();
      return res.status(409).json({ error: "Slot already booked. Please choose another." });
    }

    // B. Create the Record
    const newAppointment = await Appointment.create(
      {
        patientId,
        doctorId,
        appointmentDate,
        timeSlot,
        reason,
        amount,
        status: "scheduled",
        paymentMethod,
        paymentStatus,
        receiptImage,
      },
      { transaction: t },
    );

    await t.commit();
    console.log(`🔄 Cache Cleared for Doctor ${doctorId}`);

    // ── FCM: send confirmation push to patient ─────────────────────────────
    // Fire-and-forget; never block the HTTP response.               ← FCM
    let doctorRecord = null;
    try {                                                            // ← FCM
      doctorRecord = await Doctor.findOne({                         // ← FCM
        where: { id: doctorId },                                    // ← FCM
        include: [{ model: User, as: 'user', attributes: ['fullName'] }], // ← FCM
      });                                                            // ← FCM
      const doctorName = doctorRecord?.user?.fullName || 'your doctor';   // ← FCM
      await sendAppointmentConfirmation(                             // ← FCM
        dbUser,                                                      // ← FCM
        newAppointment,                                              // ← FCM
        { name: doctorName },                                        // ← FCM
      );                                                             // ← FCM
    } catch (fcmErr) {                                              // ← FCM
      console.warn('FCM confirmation error (non-fatal):', fcmErr.message); // ← FCM
    }                                                                // ← FCM
    // ──────────────────────────────────────────────────────────────────────

    // ── SOCKET.IO: Real-time notification for the doctor ──────────────────
    const io = req.app.get("io");
    if (io && doctorRecord && doctorRecord.userId) {
      io.to(`user_${doctorRecord.userId}`).emit("NEW_NOTIFICATION", {
        type: "NEW_APPOINTMENT",
        message: `New appointment booked by patient`,
        appointmentId: newAppointment.id
      });
    }
    // ──────────────────────────────────────────────────────────────────────

    res.status(201).json({
      success: true,
      appointment: newAppointment,
      paymentMethod,
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
      if (role === "patient")      whereClause.patientId = requestedId;
      else if (role === "doctor")  whereClause.doctorId  = requestedId;
    } else if (dbUser.role === "doctor") {
      whereClause.doctorId = dbUser.id;
    } else {
      whereClause.patientId = dbUser.id;
    }

    const include = [];
    const resolvedRole =
      dbUser.role === "admin"
        ? role || "patient"
        : dbUser.role === "doctor"
          ? "doctor"
          : "patient";

    if (resolvedRole === "patient") {
      include.push({
        model: Doctor,
        as: "doctor",
        include: [{ model: User, as: "user", attributes: ["fullName", "email"] }],
      });
    } else {
      include.push({ 
        model: User, 
        as: "patient", 
        attributes: [
          "fullName", "email", "phoneNumber", "gender", "dateOfBirth",
          "weight", "height", "bloodType", "medicalHistory", "allergies",
          "emergencyContact"
        ] 
      });
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include,
      order: [["appointmentDate", "ASC"]],
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllAppointmentsAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: User,   as: "patient", attributes: ["fullName", "phoneNumber"] },
        { model: Doctor, as: "doctor",
          include: [{ model: User, as: "user", attributes: ["fullName"] }] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = appointments.map((apt) => ({
      id:             apt.id,
      patientName:    apt.patient?.fullName    || "Guest Patient",
      patientPhone:   apt.patient?.phoneNumber || "N/A",
      doctorName:     apt.doctor?.user?.fullName || "Unassigned",
      specialization: apt.doctor?.specialization || "",
      date:           new Date(apt.appointmentDate).toLocaleDateString(),
      rawDate:
        apt.appointmentDate instanceof Date
          ? apt.appointmentDate.toISOString().split("T")[0]
          : apt.appointmentDate,
      time:     apt.timeSlot || "N/A",
      type:     apt.reason   || "General Checkup",
      location: apt.meetingLink || "In-Clinic",
      status:   apt.status,
      paymentMethod: apt.paymentMethod,
      paymentStatus: apt.paymentStatus,
      receiptImage:  apt.receiptImage,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Fetch Appointments Error:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

// 2.5 Update Appointment Status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status, paymentStatus } = req.body;

    const appt = await Appointment.findByPk(id);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    const dbUser = await getAuthenticatedDbUser(req);
    if (dbUser.role !== "admin" && dbUser.id !== appt.doctorId) {
      return res.status(403).json({ error: "You are not authorized to update this appointment." });
    }

    if (status) appt.status = status;
    if (paymentStatus) appt.paymentStatus = paymentStatus;
    
    await appt.save();

    res.json({ success: true, message: `Appointment status updated`, appointment: appt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id }   = req.params;
    const dbUser   = await getAuthenticatedDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });

    const appt = await Appointment.findByPk(id);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    if (
      dbUser.role !== "admin" &&
      dbUser.id !== appt.patientId &&
      dbUser.id !== appt.doctorId
    ) {
      return res.status(403).json({ error: "You are not allowed to cancel this appointment." });
    }

    appt.status = "cancelled";
    await appt.save();

    // ── FCM: notify patient if cancellation was by admin/doctor     ← FCM
    if (dbUser.id !== appt.patientId) {                            // ← FCM
      try {                                                          // ← FCM
        const patient = await User.findByPk(appt.patientId);        // ← FCM
        if (patient?.fcmToken) {                                     // ← FCM
          await sendAppointmentCancellation(patient, appt);         // ← FCM
        }                                                            // ← FCM
      } catch (fcmErr) {                                            // ← FCM
        console.warn('FCM cancel notification error (non-fatal):', fcmErr.message); // ← FCM
      }                                                              // ← FCM
    }                                                                // ← FCM

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3.1 Delete Appointment
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
exports.rescheduleAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id }                      = req.params;
    const { appointmentDate, timeSlot } = req.body;
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) {
      await t.rollback();
      return res.status(401).json({ error: "Unauthorized user" });
    }

    const appt = await Appointment.findByPk(id, { transaction: t });
    if (!appt) {
      await t.rollback();
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (
      dbUser.role !== "admin" &&
      dbUser.id !== appt.patientId &&
      dbUser.id !== appt.doctorId
    ) {
      await t.rollback();
      return res.status(403).json({ error: "You are not allowed to reschedule this appointment." });
    }

    const existing = await Appointment.findOne({
      where: { doctorId: appt.doctorId, appointmentDate, timeSlot, status: "scheduled" },
      transaction: t,
    });

    if (existing && existing.id !== appt.id) {
      await t.rollback();
      return res.status(409).json({ error: "This slot is already booked for the selected doctor." });
    }

    appt.appointmentDate = appointmentDate;
    appt.timeSlot        = timeSlot;
    appt.status          = "scheduled";
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
  const whereClause   = specialty ? { specialization: specialty } : {};

  try {
    const doctors = await Doctor.findAll({
      where:   whereClause,
      include: [{ model: User, as: "user", attributes: ["fullName"] }],
    });
    res.json(doctors);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 5. Check Availability
exports.getDoctorSlots = async (req, res) => {
  const doctorId = parseInt(req.params.doctorId);
  const { date } = req.query;

  try {
    const [year, month, day] = date.split("-");
    const dateObj   = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    const { Availability } = require("../models");
    const availability = await Availability.findOne({
      where: { doctorId, dayOfWeek, isAvailable: true },
    });
    console.log(
      `🔍 Looking for doctorId=${doctorId} dayOfWeek=${dayOfWeek} → Found:`,
      availability ? "YES" : "NO"
    );

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
      const displayHour = currentHour > 12 ? currentHour - 12 : currentHour === 0 ? 12 : currentHour;
      const displayMin  = currentMin === 0 ? "00" : currentMin;
      const formattedSlot = `${displayHour < 10 ? "0" : ""}${displayHour}:${displayMin} ${ampm}`;
      slots.push(formattedSlot);

      currentMin += 30;
      if (currentMin >= 60) { currentHour += 1; currentMin = 0; }
    }

    const existingBookings = await Appointment.findAll({
      where: { doctorId, appointmentDate: date, status: "scheduled" },
    });

    const bookedTimes = existingBookings.map((a) => a.timeSlot);
    const validSlots  = slots.filter((time) => !bookedTimes.includes(time));

    res.json({ date, availableSlots: validSlots });
  } catch (error) {
    console.error("Get Slots Error:", error);
    res.status(500).json({ error: error.message });
  }
};