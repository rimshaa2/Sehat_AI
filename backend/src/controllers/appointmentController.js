const { Appointment, Doctor, User, sequelize } = require('../models');
const { redisClient } = require('../config/database');

// 1. Book an Appointment (The "Transactional" Logic)
// Reference: SDS 4.1.2 - Appointment Booking Transaction
exports.bookAppointment = async (req, res) => {
  const t = await sequelize.transaction(); // Start Transaction

  try {
    const { patientId, doctorId, appointmentDate, timeSlot, reason, amount } = req.body;

    // A. Double-Booking Check (Critical for ACID)
    const existing = await Appointment.findOne({
      where: { doctorId, appointmentDate, timeSlot },
      transaction: t
    });

    if (existing) {
      await t.rollback();
      return res.status(409).json({ error: 'Slot already booked. Please choose another.' });
    }

    // B. Create the Record
    const newAppointment = await Appointment.create({
      patientId, // Ensure this ID comes from your MySQL Users table (e.g., 1, 2)
      doctorId,
      appointmentDate,
      timeSlot,
      reason,
      amount,
      status: 'scheduled',
      paymentStatus: 'completed' // Simulating successful payment
    }, { transaction: t });

    // C. Commit the Transaction
    await t.commit();

    // D. Hybrid Logic: Invalidate Redis Cache
    // If we cached doctor slots, we must clear them now so this slot shows as "taken"
    await redisClient.del(`doctor_slots_${doctorId}`); 
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
    if (role === 'patient') whereClause.patientId = userId;
    else if (role === 'doctor') whereClause.doctorId = userId;

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: role === 'patient' ? 'doctor' : 'patient', // If I'm patient, show Doctor details
          attributes: ['fullName', 'email'] 
        }
      ],
      order: [['appointmentDate', 'ASC']]
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appt = await Appointment.findByPk(id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    appt.status = 'cancelled';
    await appt.save();

    // Invalidate cache again just in case
    await redisClient.del(`doctor_slots_${appt.doctorId}`);

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};