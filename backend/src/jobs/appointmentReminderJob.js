// ─── src/jobs/appointmentReminderJob.js ──────────────────────────────────────
// Cron job that fires appointment reminder push notifications.
// Runs every 30 minutes and checks for appointments that are exactly
// ~24 h or ~1 h away (within a ±15-minute window to avoid drift).
//
// SRS Module 1.7.3 FE-2, NFR-4
//
// Usage: imported once in server.js via startAllJobs().
// ─────────────────────────────────────────────────────────────────────────────

const { Appointment, Doctor, User } = require('../models');
const { Op } = require('sequelize');
const { sendAppointmentReminder } = require('../services/notificationService');

// ── scheduler shim ────────────────────────────────────────────────────────────
// We use node-cron if available; fall back to a plain setInterval so the file
// is usable in environments that haven't installed node-cron yet.
let schedule;
try {
  schedule = require('node-cron').schedule;
} catch {
  schedule = null;
}

// ── core logic ────────────────────────────────────────────────────────────────

const WINDOW_MS = 15 * 60 * 1000; // ±15 minutes

/**
 * Finds upcoming appointments whose time matches the given hoursAhead target
 * and sends push notifications to the patients.
 */
const runReminderCheck = async (hoursAhead) => {
  const targetMs = hoursAhead * 60 * 60 * 1000;
  const now      = Date.now();
  const from     = new Date(now + targetMs - WINDOW_MS);
  const to       = new Date(now + targetMs + WINDOW_MS);

  try {
    const appointments = await Appointment.findAll({
      where: {
        status: { [Op.in]: ['scheduled', 'confirmed'] },
        appointmentDate: { [Op.between]: [from, to] },
      },
      include: [
        { model: User,   as: 'patient', attributes: ['id', 'fullName', 'fcmToken', 'notificationsEnabled'] },
        { model: Doctor, as: 'doctor',
          include: [{ model: User, as: 'user', attributes: ['fullName'] }] },
      ],
    });

    for (const appt of appointments) {
      const patient = appt.patient;
      if (!patient?.fcmToken || patient.notificationsEnabled === false) continue;

      const doctorName = appt.doctor?.user?.fullName || 'your doctor';
      await sendAppointmentReminder(
        patient,
        appt,
        { name: doctorName },
        hoursAhead,
      );
    }

    if (appointments.length) {
      console.log(`🗓️  Appointment reminders sent: ${appointments.length} (${hoursAhead}h window)`);
    }
  } catch (err) {
    console.error(`Appointment reminder job (${hoursAhead}h) error:`, err.message);
  }
};

const tick = async () => {
  await runReminderCheck(24);
  await runReminderCheck(1);
};

// ── scheduler entry ───────────────────────────────────────────────────────────

const startAppointmentReminderJob = () => {
  if (schedule) {
    // Run every 30 minutes
    schedule('*/30 * * * *', tick, { timezone: 'Asia/Karachi' });
    console.log('🗓️  Appointment reminder job scheduled (every 30 min)');
  } else {
    // Fallback: setInterval every 30 minutes
    setInterval(tick, 30 * 60 * 1000);
    console.log('🗓️  Appointment reminder job started via setInterval (every 30 min)');
  }
};

module.exports = { startAppointmentReminderJob };