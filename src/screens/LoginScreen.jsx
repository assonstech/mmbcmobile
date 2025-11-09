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
  Alert,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingScrollView } from 'react-native-keyboard-avoiding-scroll-view';
import DarkColors from '../colors/dark';
import LightColors from '../colors/light';
import DefaultTextInput from '../components/DefaultTextInput';
import DefaultButton from '../components/DefaultButton';
import { FontFamily } from '../styles/fontStyle';
import Screen from '../utils/Screen';
import { login } from '../controllers/LoginController';
import { exitApp } from '@logicwind/react-native-exit-app';
import CustomAlertModal from '../components/CustomAlertModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

export default function LoginScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const logoPosition = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const formPosition = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const secondLogoOpacity = useRef(new Animated.Value(0)).current;
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const fadeInOverlay = () => {
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const fadeOutOverlay = () => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };



  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.spring(logoPosition, {
          toValue: -SCREEN_HEIGHT / 3.2,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 0.65,
          useNativeDriver: true,
        }),
        Animated.timing(formPosition, {
          toValue: 70,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(secondLogoOpacity, {
          toValue: 0.1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 700);
    return () => clearTimeout(timeout);
  }, []);

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

  const handleLogin = async () => {
    Keyboard.dismiss();
    setLoading(true);
    fadeInOverlay();
    try {
      const res = await login(email, password);
      if (res.success) {
        navigation.replace(Screen.MainTabs);
      } else {
        setAlertMessage("Invalid email or Password");
        setAlertVisible(true);
      }
    } catch (err) {
      console.log(err)
    } finally {
      fadeOutOverlay
      setLoading(false);
    }


  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Background logo overlay */}
        <Animated.View style={[styles.secondLogoContainer, { opacity: secondLogoOpacity }]}>
          <Image
            source={require('../../src/assets/images/appLogo.png')}
            style={{ width: 361, height: 361, resizeMode: 'contain', opacity: 0.1 }}
          />
        </Animated.View>

        {/* Animated main logo behind the form */}
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

        {/* Form container with scroll only on focused input */}
        <KeyboardAvoidingScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 50 }}
          enableOnAndroid
          keyboardOpeningTime={0}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.formContainer,
              { opacity: formOpacity, transform: [{ translateY: formPosition }] },
            ]}
          >
            <View style={{ gap: 12, marginBottom: 20 }}>
              <Text style={styles.title}>Login account</Text>
              <Text style={styles.body}>
                If you don't have an account,{' '}
                <Text style={{ color: colors.signUpTextColor }}>Sign up</Text>
              </Text>
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
              <DefaultButton
                title={'Login'}
                onPress={handleLogin}
                disabled={loading}
              />
              <Text style={[styles.body, { alignSelf: 'center', marginVertical: 8 }]}>
                Forgot your password?
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingScrollView>
        <CustomAlertModal
          visible={alertVisible}
          message={alertMessage}
          confirmText="OK"
          onConfirm={() => setAlertVisible(false)}
        />
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
  );
}

const styles = StyleSheet.create({
  secondLogoContainer: {
    ...StyleSheet.absoluteFillObject,
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
