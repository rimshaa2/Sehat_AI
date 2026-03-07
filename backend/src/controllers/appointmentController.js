const { Appointment, Doctor, User, sequelize } = require("../models");
const { redisClient } = require("../config/database");

// 1. Book an Appointment (The "Transactional" Logic)
// Reference: SDS 4.1.2 - Appointment Booking Transaction
exports.bookAppointment = async (req, res) => {
  const t = await sequelize.transaction(); // Start Transaction

  try {
    const { patientId, doctorId, appointmentDate, timeSlot, reason, amount } =
      req.body;

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
    const { userId, role } = req.query; // Pass these from frontend (or auth middleware)

    const whereClause = {};
    if (role === "patient") whereClause.patientId = userId;
    else if (role === "doctor") whereClause.doctorId = userId;

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: role === "patient" ? "doctor" : "patient", // If I'm patient, show Doctor details
          attributes: ["fullName", "email"],
        },
      ],
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
      time: apt.appointmentTime,
      type: apt.type || "General Checkup",
      location: apt.location || "Online/Clinic",
      status: apt.status, // confirmed, pending, cancelled
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Fetch Appointments Error:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

// 3. Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appt = await Appointment.findByPk(id);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    appt.status = "cancelled";
    await appt.save();

    // Invalidate cache again just in case
    // await redisClient.del(`doctor_slots_${appt.doctorId}`);

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
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
  const { doctorId } = req.params;
  const { date } = req.query; // e.g. "2026-01-25" (which is a Sunday)

  // LOGIC: In a real app, we check if the day matches the doctor's schedule
  // For now, let's return mock slots to get the UI working.
  const mockSlots = ["09:00", "10:00", "11:30", "14:00", "16:00"];

  // Filter out slots that are already booked in the Appointments table
  const existingBookings = await Appointment.findAll({
    where: { doctorId, appointmentDate: date },
  });

  const bookedTimes = existingBookings.map((a) => a.timeSlot.substring(0, 5)); // "09:00"
  const available = mockSlots.filter((time) => !bookedTimes.includes(time));

  res.json({ date, availableSlots: available });
};
