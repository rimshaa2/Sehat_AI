// ─── src/hooks/usePushNotifications.ts ───────────────────────────────────────
// Safe wrapper around FCM. If @react-native-firebase/messaging is not available
// (Expo Go, simulator, missing native build) the hook does nothing and never
// throws — so Google Sign-In and all other features keep working normally.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { registerFcmToken, clearFcmToken } from '../services/api';

// ── Safe module loader ────────────────────────────────────────────────────────
// Instead of a top-level import (which crashes if the native module is absent),
// we require() inside a try/catch at runtime.
const getMessaging = (): any | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@react-native-firebase/messaging');
    // The default export is the messaging() function in v23 namespaced API
    return mod.default ?? mod;
  } catch {
    return null;
  }
};

// ── helpers ───────────────────────────────────────────────────────────────────

const showInAppAlert = (remoteMessage: any): void => {
  const title = remoteMessage?.notification?.title;
  const body  = remoteMessage?.notification?.body;
  if (!title && !body) return;
  Alert.alert(title ?? 'Sehat AI', body ?? '');
};

const uploadToken = async (token: string): Promise<void> => {
  try {
    await registerFcmToken(token);
    console.log('📱 FCM token uploaded to backend');
  } catch (err: any) {
    console.warn('FCM token upload failed (non-fatal):', err?.message);
  }
};

// ── hook ──────────────────────────────────────────────────────────────────────

interface UsePushNotificationsOptions {
  onNotificationTapped?: (remoteMessage: any) => void;
}

const usePushNotifications = (options: UsePushNotificationsOptions = {}): void => {
  const { onNotificationTapped } = options;
  const tapCallbackRef = useRef(onNotificationTapped);
  tapCallbackRef.current = onNotificationTapped;

  useEffect(() => {
    let unsubscribeForeground: (() => void) | null = null;
    let unsubscribeTokenRefresh: (() => void) | null = null;

    const setup = async () => {
      // Bail out silently if the native module isn't available.
      // This keeps Expo Go and Google Sign-In working normally.
      const messagingModule = getMessaging();
      if (!messagingModule) {
        console.log('ℹ️  FCM native module not available — skipping push setup');
        return;
      }

      try {
        const messagingInstance = messagingModule();

        // 1. Request permission
        const AuthorizationStatus = messagingModule.AuthorizationStatus;
        const authStatus = await messagingInstance.requestPermission();
        const enabled =
          authStatus === AuthorizationStatus?.AUTHORIZED ||
          authStatus === AuthorizationStatus?.PROVISIONAL;

        if (!enabled) {
          console.log('🔕 Push notification permission denied');
          return;
        }

        // 2. Register with APNs on iOS
        if (Platform.OS === 'ios') {
          await messagingInstance.registerDeviceForRemoteMessages();
        }

        // 3. Get and upload FCM token
        const token = await messagingInstance.getToken();
        if (token) await uploadToken(token);

        // 4. Foreground messages
        unsubscribeForeground = messagingInstance.onMessage(
          async (remoteMessage: any) => {
            console.log('📬 Foreground FCM:', remoteMessage?.notification?.title);
            showInAppAlert(remoteMessage);
          },
        );

        // 5. Background tap
        messagingInstance.onNotificationOpenedApp((remoteMessage: any) => {
          console.log('📲 Notification opened app from background');
          tapCallbackRef.current?.(remoteMessage);
        });

        // 6. Quit/cold-start tap
        const initialMessage = await messagingInstance.getInitialNotification();
        if (initialMessage) {
          setTimeout(() => tapCallbackRef.current?.(initialMessage), 500);
        }

        // 7. Token refresh
        unsubscribeTokenRefresh = messagingInstance.onTokenRefresh(
          async (newToken: string) => {
            console.log('🔄 FCM token refreshed');
            await uploadToken(newToken);
          },
        );

      } catch (err: any) {
        // Never crash the app over notification setup
        console.warn('FCM setup error (non-fatal):', err?.message);
      }
    };

    setup();

    return () => {
      unsubscribeForeground?.();
      unsubscribeTokenRefresh?.();
    };
  }, []);
};

export default usePushNotifications;

// ── logout helper ─────────────────────────────────────────────────────────────
export const clearPushToken = async (): Promise<void> => {
  try {
    await clearFcmToken();
    console.log('🗑️  FCM token cleared from backend');
  } catch (err: any) {
    console.warn('FCM token clear failed (non-fatal):', err?.message);
  }
};