const { Appointment, Doctor, User, sequelize } = require("../models");
const { redisClient } = require("../config/database");

const getAuthenticatedDbUser = async (req) => {
  if (req.dbUser) return req.dbUser;
  if (!req.user?.uid) return null;
  return User.findOne({ where: { firebase_uid: req.user.uid } });
};

// 1. Book an Appointment (The "Transactional" Logic)
// Reference: SDS 4.1.2 - Appointment Booking Transaction
exports.bookAppointment = async (req, res) => {
  
  const t = await sequelize.transaction(); // Start Transaction

  try {
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) {
      await t.rollback();
      return res.status(401).json({ error: "Unauthorized user" });
    }

    const { patientId, doctorId, appointmentDate, timeSlot, reason, amount } =
      req.body;
    const normalizedPatientId = Number(patientId);
    const requesterId = Number(dbUser.id);

    // Patients can only book for themselves; admins/staff may specify other patient IDs.
    if (dbUser.role === "patient" && normalizedPatientId !== requesterId) {
      await t.rollback();
      return res
        .status(403)
        .json({ error: "Patients can only book appointments for themselves." });
    }

    // A. Double-Booking Check (Critical for ACID)
    const existing = await Appointment.findOne({
      where: { doctorId, appointmentDate, timeSlot },
      transaction: t,
    });

    if (existing) {
      await t.rollback();
      return res
        .status(409)
        .json({ error: "Slot already booked. Please choose another." });
    }

    // B. Create the Record
    const newAppointment = await Appointment.create(
      {
        patientId, // Ensure this ID comes from your MySQL Users table (e.g., 1, 2)
        doctorId,
        appointmentDate,
        timeSlot,
        reason,
        amount,
        status: "scheduled",
        paymentStatus: "completed", // Simulating successful payment
      },
      { transaction: t },
    );

    // C. Commit the Transaction
    await t.commit();

    // D. Hybrid Logic: Invalidate Redis Cache
    // If we cached doctor slots, we must clear them now so this slot shows as "taken"
    // await redisClient.del(`doctor_slots_${doctorId}`);
    console.log(`🔄 Cache Cleared for Doctor ${doctorId}`);

    res.status(201).json({ success: true, appointment: newAppointment });
  } catch (error) {
    await t.rollback(); // Rollback if anything fails
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
      if (role === "patient") whereClause.patientId = requestedId;
      else if (role === "doctor") whereClause.doctorId = requestedId;
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
        include: [{
          model: User,
          as: "user",
          attributes: ["fullName", "email"]
        }],
      });
    } else {
      include.push({
        model: User,
        as: "patient",
        attributes: ["fullName", "email"]
      });
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: include,
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
        {
          model: User,
          as: "patient", // Matches your association alias
          attributes: ["fullName", "phoneNumber"],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [{ model: User, as: "user", attributes: ["fullName"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format data for the frontend table
    const formatted = appointments.map((apt) => ({
      id: apt.id,
      patientName: apt.patient?.fullName || "Guest Patient",
      patientPhone: apt.patient?.phoneNumber || "N/A",
      doctorName: apt.doctor?.user?.fullName || "Unassigned",
      specialization: apt.doctor?.specialization || "",
      date: new Date(apt.appointmentDate).toLocaleDateString(),
      rawDate: apt.appointmentDate instanceof Date ? apt.appointmentDate.toISOString().split('T')[0] : apt.appointmentDate,
      time: apt.timeSlot || "N/A",
      type: apt.reason || "General Checkup",
      location: apt.meetingLink || "In-Clinic",
      status: apt.status,
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
    const { id } = req.params;
    const { status } = req.body; // e.g., 'completed', 'scheduled', 'cancelled', 'no-show'

    const appt = await Appointment.findByPk(id);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    appt.status = status;
    await appt.save();

    res.json({ success: true, message: `Appointment status updated to ${status}`, appointment: appt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });

    const appt = await Appointment.findByPk(id);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });
    if (
      dbUser.role !== "admin" &&
      dbUser.id !== appt.patientId &&
      dbUser.id !== appt.doctorId
    ) {
      return res
        .status(403)
        .json({ error: "You are not allowed to cancel this appointment." });
    }

    appt.status = "cancelled";
    await appt.save();

    // Invalidate cache again just in case
    // await redisClient.del(`doctor_slots_${appt.doctorId}`);

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3.1 Delete Appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appt = await Appointment.findByPk(id);
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
    const { id } = req.params;
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
      return res
        .status(403)
        .json({ error: "You are not allowed to reschedule this appointment." });
    }

    // Check for double booking
    const existing = await Appointment.findOne({
      where: { doctorId: appt.doctorId, appointmentDate, timeSlot, status: "scheduled" },
      transaction: t,
    });

    if (existing && existing.id !== appt.id) {
      await t.rollback();
      return res.status(409).json({ error: "This slot is already booked for the selected doctor." });
    }

    appt.appointmentDate = appointmentDate;
    appt.timeSlot = timeSlot;
    appt.status = "scheduled"; // Reset to scheduled if it was cancelled
    await appt.save({ transaction: t });

    await t.commit();
    res.json({ success: true, message: "Appointment rescheduled successfully", appointment: appt });
  } catch (error) {
    await t.rollback();
    console.error("Reschedule Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 4. Browse Available Doctors (Activity: "Browse Available Doctors")
exports.getDoctors = async (req, res) => {
  const { specialty } = req.query;
  const whereClause = specialty ? { specialization: specialty } : {};

  try {
    const doctors = await Doctor.findAll({
      where: whereClause,
      include: [{ model: User, as: "user", attributes: ["fullName"] }],
    });
    res.json(doctors);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 5. Check Availability (Sequence: "checkAvailability() -> returnAvailableSlots()")
exports.getDoctorSlots = async (req, res) => {
  const doctorId = parseInt(req.params.doctorId);
  
  const { date } = req.query; // e.g. "2026-03-15"

  try {
    // 1. Get Day of Week (e.g. "Monday")
    const [year, month, day] = date.split('-');
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    // 2. Fetch Availability for this day
    const { Availability } = require("../models"); // Ensure it's imported
    const availability = await Availability.findOne({

      where: { doctorId, dayOfWeek, isAvailable: true }
      
    });
    console.log(`🔍 Looking for doctorId=${doctorId} dayOfWeek=${dayOfWeek} → Found:`, availability ? 'YES' : 'NO');

    if (!availability) {
      return res.json({ date, availableSlots: [] });
    }

    // 3. Generate 30 min slots
    const startHour = parseInt(availability.startTime.split(':')[0]);
    const startMin = parseInt(availability.startTime.split(':')[1]);
    const endHour = parseInt(availability.endTime.split(':')[0]);
    const endMin = parseInt(availability.endTime.split(':')[1]);

    const slots = [];
    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const ampm = currentHour >= 12 ? 'PM' : 'AM';
      const displayHour = currentHour > 12 ? currentHour - 12 : (currentHour === 0 ? 12 : currentHour);
      const displayMin = currentMin === 0 ? '00' : currentMin;
      const formattedSlot = `${displayHour < 10 ? '0' : ''}${displayHour}:${displayMin} ${ampm}`;
      
      slots.push(formattedSlot);

      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin = 0;
      }
    }

    // 4. Filter out already booked slots
    const existingBookings = await Appointment.findAll({
      where: { doctorId, appointmentDate: date, status: "scheduled" },
    });

    const normalizeSlot = (slot) =>
      String(slot || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, " ");

    const bookedTimes = existingBookings.map((a) => a.timeSlot);
    const validSlots = slots.filter((time) => !bookedTimes.includes(time));

    res.json({ date, availableSlots: validSlots });
  } catch (error) {
    console.error("Get Slots Error:", error);
    res.status(500).json({ error: error.message });
  }
};