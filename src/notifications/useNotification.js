// import { useEffect } from 'react';
// import { PermissionsAndroid, Platform } from 'react-native';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { AndroidImportance } from '@notifee/react-native';

// const requestUserPermission = async () => {
//   if (Platform.OS === 'android' && Platform.Version >= 33) {
//     const granted = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//     );
//     console.log(
//       granted === PermissionsAndroid.RESULTS.GRANTED
//         ? '✅ Notification permission granted'
//         : '❌ Notification permission denied'
//     );
//   } else if (Platform.OS === 'ios') {
//     await notifee.requestPermission();
//   }
// };

// // 🔔 Custom Notifee notification display
// const displayNotification = async (title, body) => {
//   try {
//     const channelId = await notifee.createChannel({
//       id: 'default',
//       name: 'Default Channel',
//       importance: AndroidImportance.HIGH,
//     });

//     await notifee.displayNotification({
//       title: title || 'New Message',
//       body: body || 'You received a new notification',
//       android: {
//         channelId,
//         smallIcon: 'ic_launcher', // must exist in your resources
//         importance: AndroidImportance.HIGH,
//         pressAction: { id: 'default' },
//       },
//     });
//   } catch (error) {
//     console.error('Error showing notification:', error);
//   }
// };

// export const useNotification = () => {
//   useEffect(() => {
//     const setupNotifications = async () => {
//       await requestUserPermission();

//       // ✅ Get FCM token
//       const token = await messaging().getToken();
//       console.log('📱 FCM Token:', token);

//       // ✅ Subscribe to topic
//       try {
//         await messaging().subscribeToTopic('mmbc');
//         console.log('📡 Subscribed to topic: mmbc');
//       } catch (err) {
//         console.error('❌ Failed to subscribe to topic:', err);
//       }

//       // ✅ Foreground messages
//       const unsubscribe = messaging().onMessage(async remoteMessage => {
//         console.log('💬 Foreground message received:', remoteMessage);
//         const { title, body } = remoteMessage.data || remoteMessage.notification || {};
//         await displayNotification(title, body);
//       });

//       // ✅ Background messages (handled once globally)
//       messaging().setBackgroundMessageHandler(async remoteMessage => {
//         console.log('📩 Background message received:', remoteMessage);
//         const { title, body } = remoteMessage.data || remoteMessage.notification || {};
//         await displayNotification(title, body);
//       });

//       return unsubscribe;
//     };

//     setupNotifications();
//   }, []);
// };
