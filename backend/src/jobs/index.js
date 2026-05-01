// ─── src/jobs/index.js ───────────────────────────────────────────────────────
// Central job registry. Import and call startAllJobs() once in server.js.
// ─────────────────────────────────────────────────────────────────────────────

const { startAppointmentReminderJob } = require('./appointmentReminderJob');
const { startMedicineReminderJob }    = require('./medicineReminderJob');

const startAllJobs = () => {
  console.log('⏰ Starting background notification jobs...');
  startAppointmentReminderJob();
  startMedicineReminderJob();
};

module.exports = { startAllJobs };