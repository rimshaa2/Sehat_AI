// ─── src/utils/notificationChannel.ts ────────────────────────────────────────
// Creates the Android notification channel that all Sehat AI push
// notifications are delivered on. Must be called once at app startup
// (before any notification can be shown) — call from index.ts.
//
// iOS does not use channels; this is a no-op on iOS.
//
// SRS NFR-4
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';

/**
 * Idempotent — safe to call every time the app boots.
 * On Android 8+ (API 26+) a channel must exist before a notification can appear.
 */
export const ensureNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;
  try {
    await notifee.createChannel({
      id:          'sehat_ai_default',
      name:        'Sehat AI Notifications',
      description: 'Medicine reminders and appointment alerts from Sehat AI',
      importance:  AndroidImportance.HIGH,
      sound:       'default',
      vibration:   true,
    });
  } catch (err: any) {
    // Non-fatal: app still works, notifications just won't show on Android 8+
    console.warn('Notification channel creation failed (non-fatal):', err?.message);
  }
};