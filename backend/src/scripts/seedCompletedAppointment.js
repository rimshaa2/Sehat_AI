const { Appointment, Doctor, User } = require('../models');
const { connectDB } = require('../config/database');

async function seed() {
  await connectDB();
  
  // Find any appointment
  const apt = await Appointment.findOne();
  if (apt) {
    apt.status = 'completed';
    await apt.save();
    console.log(`Updated appointment ${apt.id} to completed!`);
  } else {
    // We need to create one, but that requires a doctor and a user.
    const doctor = await Doctor.findOne();
    const patient = await User.findOne({ where: { role: 'patient' } });
    
    if (doctor && patient) {
      const newApt = await Appointment.create({
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: '10:00 AM',
        reason: 'General Checkup',
        amount: 1000,
        status: 'completed',
        paymentStatus: 'paid'
      });
      console.log(`Created new completed appointment ${newApt.id}!`);
    } else {
      console.log('No doctor or patient found in DB to create an appointment.');
    }
  }
  process.exit(0);
}

seed();
