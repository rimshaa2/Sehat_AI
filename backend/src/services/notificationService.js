// ─── src/services/notificationService.js ─────────────────────────────────────
// Firebase Cloud Messaging (FCM) push notification service.
// Covers SRS Module 1.7.4 FE-1 (medication reminders) and
// Module 1.7.3 FE-2 (appointment reminders), NFR-4.
//
// All sends are fire-and-forget; failures are logged but never bubble up to
// the caller so a bad FCM token never breaks a booking or medicine save.
// ─────────────────────────────────────────────────────────────────────────────

const admin = require('../config/firebase');

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Low-level FCM send. Returns true on success, false on any error.
 * Automatically removes stale/invalid tokens from the User record.
 *
 * @param {string}  fcmToken   - Device FCM registration token
 * @param {object}  notification - { title, body }
 * @param {object}  data         - arbitrary string k/v payload for the app
 * @param {object}  userModel    - Sequelize User instance (used to purge bad tokens)
 */
const sendToToken = async (fcmToken, notification, data = {}, userModel = null) => {
  if (!admin || !fcmToken) return false;

  const message = {
    token: fcmToken,
    notification: {
      title: notification.title,
      body:  notification.body,
    },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
    android: {
      priority: 'high',
      notification: { channelId: 'sehat_ai_default', sound: 'default' },
    },
    apns: {
      payload: { aps: { sound: 'default', badge: 1 } },
    },
  };

  try {
    await admin.messaging().send(message);
    console.log(`✅ FCM sent → "${notification.title}"`);
    return true;
  } catch (err) {
    const staleErrors = [
      'messaging/registration-token-not-registered',
      'messaging/invalid-registration-token',
    ];
    if (staleErrors.includes(err.code) && userModel) {
      console.warn(`⚠️  Stale FCM token detected – clearing for user ${userModel.id}`);
      await userModel.update({ fcmToken: null }).catch(() => {});
    } else {
      console.error('FCM send error:', err.code || err.message);
    }
    return false;
  }
};

/**
 * Batch-send to multiple tokens. Silently ignores nulls/empties.
 */
const sendToMany = async (tokens, notification, data = {}) => {
  if (!admin) return;
  const valid = tokens.filter(Boolean);
  if (!valid.length) return;

  const message = {
    notification: { title: notification.title, body: notification.body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
    tokens: valid,
    android: { priority: 'high', notification: { channelId: 'sehat_ai_default' } },
    apns:    { payload: { aps: { sound: 'default', badge: 1 } } },
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ FCM multicast: ${response.successCount} ok / ${response.failureCount} failed`);
  } catch (err) {
    console.error('FCM multicast error:', err.message);
  }
};

// ── Public notification senders ───────────────────────────────────────────────

/**
 * Appointment confirmation — sent to patient immediately after booking.
 * SRS 1.7.3 FE-2
 */
const sendAppointmentConfirmation = async (user, appointment, doctor) => {
  if (!user?.fcmToken) return;
  const dateStr = new Date(appointment.appointmentDate).toLocaleDateString('en-PK', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
  await sendToToken(
    user.fcmToken,
    {
      title: '✅ Appointment Confirmed',
      body:  `Your appointment with ${doctor.name} on ${dateStr} at ${appointment.timeSlot} is confirmed.`,
    },
    { type: 'APPOINTMENT_CONFIRMED', appointmentId: String(appointment.id) },
    user,
  );
};

/**
 * Appointment reminder — sent 24 h and 1 h before the appointment.
 * Scheduled via the cron job in appointmentReminderJob.js.
 * SRS 1.7.3 FE-2
 */
const sendAppointmentReminder = async (user, appointment, doctor, hoursAhead) => {
  if (!user?.fcmToken) return;
  const label = hoursAhead === 24 ? 'tomorrow' : 'in 1 hour';
  await sendToToken(
    user.fcmToken,
    {
      title: '🗓️ Appointment Reminder',
      body:  `You have an appointment with ${doctor.name} ${label} at ${appointment.timeSlot}.`,
    },
    { type: 'APPOINTMENT_REMINDER', appointmentId: String(appointment.id), hoursAhead: String(hoursAhead) },
    user,
  );
};

/**
 * Appointment cancellation notice — sent to patient when admin or doctor cancels.
 */
const sendAppointmentCancellation = async (user, appointment) => {
  if (!user?.fcmToken) return;
  const dateStr = new Date(appointment.appointmentDate).toLocaleDateString('en-PK', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  await sendToToken(
    user.fcmToken,
    {
      title: '❌ Appointment Cancelled',
      body:  `Your appointment on ${dateStr} at ${appointment.timeSlot} has been cancelled.`,
    },
    { type: 'APPOINTMENT_CANCELLED', appointmentId: String(appointment.id) },
    user,
  );
};

/**
 * Medicine dose reminder — fired by the cron job in medicineReminderJob.js
 * for each scheduled dose time. SRS 1.7.4 FE-1, NFR-4.
 *
 * @param {object} user        - Sequelize User instance (needs .fcmToken)
 * @param {object} medicine    - plain medicine object { name, dose, unit }
 */
const sendMedicineReminder = async (user, medicine) => {
  if (!user?.fcmToken) return;
  await sendToToken(
    user.fcmToken,
    {
      title: '💊 Medicine Reminder',
      body:  `Time to take your ${medicine.name} — ${medicine.dose}${medicine.unit}.`,
    },
    { type: 'MEDICINE_REMINDER', medicineId: String(medicine.id), medicineName: medicine.name },
    user,
  );
};

/**
 * Low-stock alert — sent when stock drops to ≤ 3 doses.
 */
const sendLowStockAlert = async (user, medicine) => {
  if (!user?.fcmToken) return;
  await sendToToken(
    user.fcmToken,
    {
      title: '⚠️ Low Medicine Stock',
      body:  `You only have ${medicine.stock} dose(s) of ${medicine.name} left. Time to refill!`,
    },
    { type: 'LOW_STOCK', medicineId: String(medicine.id) },
    user,
  );
};

/**
 * General system notification (admin broadcast, wellness nudges, etc.).
 */
const sendSystemNotification = async (tokens, title, body, data = {}) => {
  await sendToMany(tokens, { title, body }, data);
};

module.exports = {
  sendToToken,
  sendToMany,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation,
  sendMedicineReminder,
  sendLowStockAlert,
  sendSystemNotification,
};