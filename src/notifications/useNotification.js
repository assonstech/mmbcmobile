import { useEffect } from 'react';
import { OneSignal, LogLevel } from 'react-native-onesignal';

const ONE_SIGNAL_APP_ID = '1525beea-619c-44b2-89d1-94a139d8bf2f'; // Your App ID

export const useNotification = () => {
  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    const initializeOneSignal = async (attempt = 1) => {
      try {
        OneSignal.initialize(ONE_SIGNAL_APP_ID);

        // Request permissions
        await OneSignal.Notifications.requestPermission(false);

        // Optional: Event listeners
        OneSignal.Notifications.addEventListener('received', notification => {
          console.log('Notification received:', notification);
        });

        OneSignal.Notifications.addEventListener('opened', result => {
          console.log('Notification opened:', result);
        });

        console.log('OneSignal initialized successfully');
      } catch (err) {
        console.warn(`OneSignal initialization failed, attempt ${attempt}:`, err);
        // Retry up to 3 times with delay
        if (attempt < 3) {
          setTimeout(() => initializeOneSignal(attempt + 1), 3000);
        } else {
          console.error('Failed to initialize OneSignal after multiple attempts');
        }
      }
    };

    initializeOneSignal();
  }, []);
};
