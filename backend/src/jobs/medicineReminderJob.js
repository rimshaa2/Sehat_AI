// ─── src/jobs/medicineReminderJob.js ─────────────────────────────────────────
// Cron job that fires medication dose reminder push notifications.
//
// Strategy
// ────────
// Runs every minute. For each MedicineLog it checks whether any of the
// medicine's `times` array values match the current HH:MM (Pakistan time).
// If today's dose index is not yet taken, it sends a reminder to the user.
//
// SRS Module 1.7.4 FE-1, NFR-4
// ─────────────────────────────────────────────────────────────────────────────

const { MedicineLog, User } = require('../models');
const { sendMedicineReminder, sendLowStockAlert } = require('../services/notificationService');

let schedule;
try {
  schedule = require('node-cron').schedule;
} catch {
  schedule = null;
}

// ── helpers ───────────────────────────────────────────────────────────────────

/** Return "HH:MM" for the current time in Asia/Karachi */
const getPKTTime = () =>
  new Date().toLocaleTimeString('en-PK', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Karachi',
  });

/**
 * Normalise a time string to "HH:MM" (24-hour).
 * Handles "08:00 AM", "8:00 AM", "14:30", "9:00 PM", etc.
 */
const normaliseTime = (raw) => {
  if (!raw) return null;
  const str = raw.trim();

  // Already 24-hour: "14:30"
  if (/^\d{1,2}:\d{2}$/.test(str)) {
    const [h, m] = str.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }

  // 12-hour: "02:30 PM" or "9:00 AM"
  const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m  = match[2];
    const ap = match[3].toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  }

  return null;
};

/**
 * Monday-based day index (0 = Mon … 6 = Sun), matching the frontend convention.
 */
const getTodayIndex = () => {
  const d = new Date().getDay(); // 0 = Sun
  return d === 0 ? 6 : d - 1;
};

const safeParseArray = (value, fallback = []) => {
  try {
    const p = JSON.parse(value || '[]');
    return Array.isArray(p) ? p : fallback;
  } catch {
    return fallback;
  }
};

const LOW_STOCK_THRESHOLD = 3;

// ── core logic ────────────────────────────────────────────────────────────────

const runMedicineReminderCheck = async () => {
  const currentTime = getPKTTime();
  const todayIdx    = getTodayIndex();

  try {
    // Fetch all active medicines with their owners in a single query
    const medicines = await MedicineLog.findAll({
      include: [{
        model: User,
        as:    'user',
        attributes: ['id', 'fcmToken', 'notificationsEnabled'],
        where: { notificationsEnabled: true },
        required: true,
      }],
    });

    for (const med of medicines) {
      const user  = med.user;
      if (!user?.fcmToken) continue;

      const times = safeParseArray(med.times);
      const taken = safeParseArray(med.taken, Array(7).fill(false));

      // Check if any scheduled dose time matches current minute
      const isNow = times.some((t) => normaliseTime(t) === currentTime);
      if (!isNow) continue;

      // Only remind if today's dose hasn't been taken yet
      if (taken[todayIdx]) continue;

      await sendMedicineReminder(user, {
        id:   med.id,
        name: med.name,
        dose: med.dose,
        unit: med.unit,
      });

      // Low-stock alert (separate notification, same tick)
      if (Number(med.stock) <= LOW_STOCK_THRESHOLD && Number(med.stock) > 0) {
        await sendLowStockAlert(user, { id: med.id, name: med.name, stock: med.stock });
      }
    }
  } catch (err) {
    console.error('Medicine reminder job error:', err.message);
  }
};

// ── scheduler entry ───────────────────────────────────────────────────────────

const startMedicineReminderJob = () => {
  if (schedule) {
    // Run every minute
    schedule('* * * * *', runMedicineReminderCheck, { timezone: 'Asia/Karachi' });
    console.log('💊 Medicine reminder job scheduled (every minute)');
  } else {
    setInterval(runMedicineReminderCheck, 60 * 1000);
    console.log('💊 Medicine reminder job started via setInterval (every minute)');
  }
};

module.exports = { startMedicineReminderJob };