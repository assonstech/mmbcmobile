import { useEffect } from 'react';
import { OneSignal, LogLevel } from 'react-native-onesignal';
import { jwtDecode } from 'jwt-decode';
import HttpSerivce from '../common/HttpSerivce';

const ONE_SIGNAL_APP_ID = '1525beea-619c-44b2-89d1-94a139d8bf2f';

let isInitialized = false;
let lastLoggedInMemberId = null;

const foregroundWillDisplayHandler = event => {
  console.log('Notification received:', event);
  event.preventDefault();
  event.notification.display();
};

const notificationClickHandler = event => {
  console.log('Notification opened:', event);
};

export const initializeOneSignal = () => {
  if (isInitialized) return;

  OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  OneSignal.initialize(ONE_SIGNAL_APP_ID);
  OneSignal.Notifications.requestPermission(false);

  OneSignal.Notifications.addEventListener(
    'foregroundWillDisplay',
    foregroundWillDisplayHandler,
  );
  OneSignal.Notifications.addEventListener('click', notificationClickHandler);

  isInitialized = true;
};

export const loginOneSignalWithMemberId = memberId => {
  if (!memberId) return;

  initializeOneSignal();

  const nextMemberId = String(memberId);
  if (lastLoggedInMemberId === nextMemberId) return;

  OneSignal.login(nextMemberId);
  lastLoggedInMemberId = nextMemberId;
  console.log('OneSignal login:', nextMemberId);
};

export const loginOneSignalWithToken = token => {
  if (!token) return;

  try {
    const payload = jwtDecode(token);
    loginOneSignalWithMemberId(payload?.memberId);
  } catch (error) {
    console.error('Failed to login OneSignal with token:', error);
  }
};

export const logoutOneSignal = () => {
  initializeOneSignal();
  OneSignal.logout();
  lastLoggedInMemberId = null;
};

export const useNotification = () => {
  useEffect(() => {
    let isActive = true;

    initializeOneSignal();

    const loginSavedUser = async () => {
      const token = await HttpSerivce.getAccessToken();
      if (isActive && token) {
        loginOneSignalWithToken(token);
      }
    };

    loginSavedUser();

    return () => {
      isActive = false;
      OneSignal.Notifications.removeEventListener(
        'foregroundWillDisplay',
        foregroundWillDisplayHandler,
      );
      OneSignal.Notifications.removeEventListener('click', notificationClickHandler);
      isInitialized = false;
    };
  }, []);
};
