import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import OrganizationDetailScreen from './src/screens/OrganizationDetailScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import MyProfileScreen from './src/screens/MyProfileScreen';
import NoteScreen from './src/screens/NoteScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import NonMemberEmailScreen from './src/screens/NonMemberEmailScreen';
import NonMemberInfoScreen from './src/screens/NonMemberInfoScreen';
import NonMemberVerificationScreen from './src/screens/NonMemberVerificationScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import EventDetailScreen from './src/screens/EventDetailScreen'
import EventRegistrationAsScreen from './src/screens/EventRegistrationAsScreen'
import GuestScreen from './src/screens/GuestScreen'
import OrganizationChart from './src/screens/OrganizationChart'
import SignUpScreen from './src/screens/RegisterScreen'
import GuestDetailScreen from './src/screens/GuestDetailScreen'
import NetworkErrorScreen from './src/screens/NetworkErrorScreen'
import DeleteAccountScreen from './src/screens/DeleteAccountScreen'
import ReceiptInformationScreen from './src/screens/ReceiptInformationScreen'
import SeasonalPromotionDetailScreen from './src/screens/SeasonalPromotionDetailScreen'
import PdfViewerScreen from './src/screens/PdfViewerScreen'
import NewsletterByDateScreen from './src/screens/NewsletterByDateScreen'
import NewsletterDetailScreen from './src/screens/NewsletterDetailScreen'
import MouPartnersScreen from './src/screens/MouPartnersScreen'
import InAppWebViewScreen from './src/screens/InAppWebViewScreen'
import MemberDirectoryScreen from './src/screens/MemberDirectoryScreen'
import MemberDirectoryDetailScreen from './src/screens/MemberDirectoryDetailScreen'


import { navigationRef } from './src/common/NavigationService';


import MainTabs from './src/screens/MainTabs';
import DarkColors from './src/colors/dark';
import Screen from './src/utils/Screen';
import { useNotification } from "./src/notifications/useNotification";
import BenefitScreen from './src/screens/BenfitScreen';
import Orientation from 'react-native-orientation-locker';



const Stack = createNativeStackNavigator();
const isDarkMode = true;

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  useNotification()

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('ACCESS_TOKEN');
        if (token) {
          setInitialRoute(Screen.MainTabs);
        } else {
          setInitialRoute(Screen.Welcome);
        }
      } catch (err) {
        setInitialRoute(Screen.Welcome);
      }
    };

    checkToken();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DarkColors.background }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={DarkColors.background}
      />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
          <Stack.Screen name={Screen.MainTabs} component={MainTabs} />
          <Stack.Screen name={Screen.Welcome} component={WelcomeScreen} />
          <Stack.Screen name={Screen.Login} component={LoginScreen} />
          <Stack.Screen name={Screen.OrganizationDetail} component={OrganizationDetailScreen} />
          <Stack.Screen name={Screen.PrivacyPolicy} component={PrivacyPolicyScreen} />
          <Stack.Screen name={Screen.MyProfile} component={MyProfileScreen} />
          <Stack.Screen name={Screen.Note} component={NoteScreen} />
          <Stack.Screen name={Screen.ChangePassword} component={ChangePasswordScreen} />
          <Stack.Screen name={Screen.ForgotPassword} component={ForgotPasswordScreen} />
          <Stack.Screen name={Screen.VerificationScreen} component={VerificationScreen} />
          <Stack.Screen name={Screen.NonMemberEmail} component={NonMemberEmailScreen} />
          <Stack.Screen name={Screen.NonMemberInfo} component={NonMemberInfoScreen} />
          <Stack.Screen name={Screen.NonMemberVerification} component={NonMemberVerificationScreen} />
          <Stack.Screen name={Screen.ResetPasswordScreen} component={ResetPasswordScreen} />
          <Stack.Screen name={Screen.EventDetailScreen} component={EventDetailScreen} />
          <Stack.Screen name={Screen.EventRegistrationAsScreen} component={EventRegistrationAsScreen} />
          <Stack.Screen name={Screen.GuestScreen} component={GuestScreen} />
          <Stack.Screen name={Screen.OrganizationChart} component={OrganizationChart} />
          <Stack.Screen name={Screen.SignUp} component={SignUpScreen} />
          <Stack.Screen name={Screen.GuestDetail} component={GuestDetailScreen} />
          <Stack.Screen name={Screen.NetworkError} component={NetworkErrorScreen} />
          <Stack.Screen name={Screen.Benefit} component={BenefitScreen} />
          <Stack.Screen name={Screen.DeleteAccount} component={DeleteAccountScreen} />
          <Stack.Screen name={Screen.ReceiptInformation} component={ReceiptInformationScreen} />
          <Stack.Screen name={Screen.SeasonalPromotionDetail} component={SeasonalPromotionDetailScreen} />
          <Stack.Screen name={Screen.PdfViewer} component={PdfViewerScreen} />
          <Stack.Screen name={Screen.NewsletterByDate} component={NewsletterByDateScreen} />
          <Stack.Screen name={Screen.NewsletterDetail} component={NewsletterDetailScreen} />
          <Stack.Screen name={Screen.MouPartners} component={MouPartnersScreen} />
          <Stack.Screen name={Screen.InAppWebView} component={InAppWebViewScreen} />
          <Stack.Screen name={Screen.MemberDirectory} component={MemberDirectoryScreen} />
          <Stack.Screen name={Screen.MemberDirectoryDetail} component={MemberDirectoryDetailScreen} />


        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
} 
