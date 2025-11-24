import { useEffect } from 'react';
import { OneSignal, LogLevel } from 'react-native-onesignal';

const ONE_SIGNAL_APP_ID = '1525beea-619c-44b2-89d1-94a139d8bf2f'; // Replace with your actual OneSignal App ID

export const useNotification = () => {
  useEffect(() => {
    // Enable verbose logging (remove in production)
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);


    // Initialize OneSignal
    OneSignal.initialize(ONE_SIGNAL_APP_ID);

    // Prompt for push notifications (optional, can remove after testing)
    OneSignal.Notifications.requestPermission(false);

    // Optional: Handle notification received while app is in foreground
    const foregroundHandler = OneSignal.Notifications.addEventListener(
      'received',
      notification => {
        console.log('Notification received:', notification);
      }
    );

    // Optional: Handle notification opened
    const openedHandler = OneSignal.Notifications.addEventListener(
      'opened',
      result => {
        console.log('Notification opened:', result);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      foregroundHandler?.remove();
      openedHandler?.remove();
    };
  }, []);
};
