import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Text,
  View,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  BackHandler,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import DarkColors from '../colors/dark';
import LightColors from '../colors/light';
import DefaultTextInput from '../components/DefaultTextInput';
import DefaultButton from '../components/DefaultButton';
import { FontFamily } from '../styles/fontStyle';
import Screen from '../utils/Screen';
import { login } from '../controllers/LoginController';
import { exitApp } from '@logicwind/react-native-exit-app';
import CustomAlertModal from '../components/CustomAlertModal';
import { sendOTP } from '../controllers/OTPController';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

export default function LoginScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const logoPosition = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const formPosition = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const secondLogoOpacity = useRef(new Animated.Value(0)).current;

  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const fadeInOverlay = () =>
    Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();

  const fadeOutOverlay = () =>
    Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();

  // Animate logo and form on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoPosition, {
          toValue: -SCREEN_HEIGHT / 3.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, { toValue: 0.65, useNativeDriver: true }),
        Animated.timing(formPosition, { toValue: 70, duration: 500, useNativeDriver: true }),
        Animated.timing(formOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(secondLogoOpacity, { toValue: 0.5, duration: 500, useNativeDriver: true }),
      ]).start();
    }, 700);

    return () => clearTimeout(timeout);
  }, []);

  // Handle back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  // ----------------------------
  // FIX: Samsung Keyboard Issue
  // ----------------------------

  const handleKeyboardShow = () => {
    Animated.parallel([
      Animated.timing(logoPosition, {
        toValue: -SCREEN_HEIGHT / 3.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleKeyboardHide = () => {
    Animated.parallel([
      Animated.timing(logoPosition, {
        toValue: -SCREEN_HEIGHT / 3.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 0.65,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const show1 = Keyboard.addListener("keyboardWillShow", handleKeyboardShow);
    const show2 = Keyboard.addListener("keyboardDidShow", handleKeyboardShow);

    const hide1 = Keyboard.addListener("keyboardWillHide", handleKeyboardHide);
    const hide2 = Keyboard.addListener("keyboardDidHide", handleKeyboardHide);

    return () => {
      show1.remove();
      show2.remove();
      hide1.remove();
      hide2.remove();
    };
  }, []);

  // Login logic
  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    fadeInOverlay();

    try {
      const res = await login(email, password);

      if (!res.success) {
        setAlertMessage("Invalid email or password");
        setAlertVisible(true);
        return;
      }

      const { status, startDate, endDate } = res.data || {};
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      // if (status !== "Approved") {
      //   setAlertMessage("Your account is not approved yet.");
      //   setAlertVisible(true);
      //   return;
      // }

      // if (!(now >= start && now <= end)) {
      //   setAlertMessage("Your account is currently inactive. Please contact support.");
      //   setAlertVisible(true);
      //   return;
      // }
      switch (status) {
        case "Approved":
          // continue normally
          break;

        case "Deleted":
          setAlertMessage("Invalid email or password");
          setAlertVisible(true);
          return;

        default:
          setAlertMessage("Your account is not approved yet.");
          setAlertVisible(true);
          return;
      }


      const token = res.data?.token;
      const isDefaultPassword = res.data?.isDefaultPassword;

      const response = await sendOTP(email);
      console.log("OTP Response:", response);
      if (response?.success) {
        navigation.navigate(Screen.VerificationScreen, {
          email,
          token,
          isDefaultPassword,
        });
      } else {
        setAlertMessage(response?.message || "Failed to send OTP. Please check your email");
        setAlertVisible(true);
      }
    } catch (err) {
      setAlertMessage("Something went wrong. Please try again.");
      setAlertVisible(true);
    } finally {
      fadeOutOverlay();
      setLoading(false);
    }
  }, [email, password, navigation]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>

          {/* Background big logo */}
          <Animated.View style={[styles.secondLogoContainer, { opacity: secondLogoOpacity }]}>
            <Image
              source={require('../../src/assets/images/appLogo.png')}
              style={{ width: 361, height: 361, resizeMode: 'contain', opacity: 0.1 }}
            />
          </Animated.View>

          {/* Main animated logo */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              transform: [{ translateY: logoPosition }, { scale: logoScale }],
              zIndex: 0,
            }}
          >
            <Image
              source={require('../../src/assets/images/appLogo.png')}
              style={{ width: '80%', height: '80%', resizeMode: 'contain' }}
            />
          </Animated.View>

          {/* Scrollable login form */}
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 50 }}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[styles.formContainer, { opacity: formOpacity, transform: [{ translateY: formPosition }] }]}
            >
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.title}>Login account</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <Text style={styles.body}>If you don't have an account, </Text>
                  <TouchableOpacity onPress={() => navigation.navigate(Screen.SignUp)}>
                    <Text style={{ color: colors.signUpTextColor }}>Sign up</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <DefaultTextInput
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
              />

              <DefaultTextInput
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <View>
                <DefaultButton title="Login" onPress={handleLogin} disabled={loading} />

                <TouchableOpacity
                  onPress={() => navigation.navigate(Screen.ForgotPassword, { isFromLogin: true })}
                >
                  <Text style={[styles.body, { alignSelf: 'center', marginVertical: 8 }]}>
                    Forgot your password?
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>

          {/* Alert */}
          <CustomAlertModal
            visible={alertVisible}
            message={alertMessage}
            confirmText="OK"
            onConfirm={() => setAlertVisible(false)}
          />

          {/* Loader overlay */}
          {loading && (
            <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
              <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loaderText}>Logging In...</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  secondLogoContainer: {
    ...StyleSheet.absoluteFill,
    marginTop: '15%',
    alignItems: 'center',
    zIndex: 0,
  },
  title: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: colors.text,
  },
  body: {
    fontFamily: FontFamily.Regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.loginAccountColor,
    fontWeight: '500',
  },
  formContainer: {
    width: '95%',
    alignSelf: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    paddingBottom: 60,
    marginBottom: 50,
    gap: Platform.OS === 'ios' ? 10 : 6,
    zIndex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  loaderBox: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 14,
    alignItems: "center",
  },
  loaderText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
  },
});
