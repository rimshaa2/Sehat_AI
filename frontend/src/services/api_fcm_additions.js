// ─── ADDITION to src/services/api.js ────────────────────────────────────────
// Add these two functions to the BOTTOM of the existing api.js file.
// They call the backend notification routes added in notificationRoutes.js.
//
// SRS Module 1.7.4 FE-1, 1.7.3 FE-2
// ─────────────────────────────────────────────────────────────────────────────

// ==========================================
// 9. Push Notification Service
// ==========================================

/**
 * Register (or update) the device's FCM token with the backend.
 * Called by usePushNotifications hook after obtaining the token.
 *
 * @param {string} fcmToken - FCM registration token from messaging().getToken()
 */
export const registerFcmToken = async (fcmToken) => {
  const response = await api.post('/api/notifications/register-token', { fcmToken });
  return response.data;
};

/**
 * Remove the FCM token from the backend on logout.
 * Called by clearPushToken() helper in usePushNotifications.ts.
 */
export const clearFcmToken = async () => {
  const response = await api.delete('/api/notifications/register-token');
  return response.data;
};