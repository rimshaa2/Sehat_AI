// ─── src/routes/notificationRoutes.js ────────────────────────────────────────
// Routes for FCM device-token registration and test utilities.
// ─────────────────────────────────────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { User }   = require('../models');
const {
  sendMedicineReminder,
  sendAppointmentReminder,
} = require('../services/notificationService');

// ── POST /api/notifications/register-token ────────────────────────────────────
// Called by the frontend after obtaining the FCM token from
// @react-native-firebase/messaging. Saves the token to the User row so the
// cron jobs can look it up without an extra query.
//
// Body: { fcmToken: string }
router.post('/register-token', verifyToken, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ error: 'fcmToken is required' });

    const user = await User.findOne({ where: { firebase_uid: req.user.uid } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({ fcmToken });
    console.log(`📱 FCM token registered for user ${user.id}`);
    return res.json({ success: true });
  } catch (err) {
    console.error('Register token error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/notifications/register-token ──────────────────────────────────
// Clear the FCM token on logout so the user no longer receives notifications.
router.delete('/register-token', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { firebase_uid: req.user.uid } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({ fcmToken: null });
    console.log(`🗑️  FCM token cleared for user ${user.id}`);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/notifications/test ─────────────────────────────────────────────
// Developer-only endpoint: send a test notification to the logged-in user.
// Remove or guard this behind an admin check in production.
router.post('/test', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { firebase_uid: req.user.uid } });
    if (!user?.fcmToken) {
      return res.status(400).json({ error: 'No FCM token registered for this user' });
    }

    const { type = 'medicine' } = req.body;

    if (type === 'medicine') {
      await sendMedicineReminder(user, { id: 0, name: 'Paracetamol', dose: '500', unit: 'mg' });
    } else {
      await sendAppointmentReminder(
        user,
        { id: 0, timeSlot: '10:00 AM', appointmentDate: new Date() },
        { name: 'Dr. Test' },
        24,
      );
    }

    return res.json({ success: true, message: `Test ${type} notification sent` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;