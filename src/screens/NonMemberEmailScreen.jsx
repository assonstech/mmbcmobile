import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderWithActions from "../components/HeaderWithActions";
import DefaultTextInput from "../components/DefaultTextInput";
import CustomAlertModal from "../components/CustomAlertModal";
import { FontFamily } from "../styles/fontStyle";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import Screen from "../utils/Screen";
import {
  checkNonMemberEmail,
  sendNonMemberOTP,
} from "../controllers/NonMemberController";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const NonMemberEmailScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertAction, setAlertAction] = useState(() => () => setAlertVisible(false));
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const isValidEmail = /\S+@\S+\.\S+/.test(email.trim());

  const fadeInOverlay = useCallback(() => {
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [overlayOpacity]);

  const fadeOutOverlay = useCallback(() => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [overlayOpacity]);

  const showAlert = (title, message, onConfirm = () => setAlertVisible(false)) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertAction(() => onConfirm);
    setAlertVisible(true);
  };

  const goToOtp = async (checkedEmail) => {
    const otpRes = await sendNonMemberOTP(checkedEmail);
    if (!otpRes?.success) {
      showAlert("OTP failed", otpRes?.message || "Failed to send OTP. Please try again.");
      return;
    }

    navigation.navigate(Screen.NonMemberVerification, { email: checkedEmail });
  };

  const handleNext = async () => {
    if (!isValidEmail || loading) return;

    const checkedEmail = email.trim().toLowerCase();
    Keyboard.dismiss();
    setLoading(true);
    fadeInOverlay();

    try {
      const res = await checkNonMemberEmail(checkedEmail);
      if (!res.success) {
        showAlert("Email check failed", res.message || "Please try again.");
        return;
      }

      if (res.status === "member") {
        showAlert(
          "Already registered",
          res.message || "This email is already registered as a member. Please login with your username and password.",
          () => {
            setAlertVisible(false);
            navigation.navigate(Screen.Login);
          }
        );
        return;
      }

      if (res.status === "nonMember") {
        await goToOtp(checkedEmail);
        return;
      }

      navigation.navigate(Screen.NonMemberInfo, { email: checkedEmail });
    } finally {
      fadeOutOverlay();
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithActions
        onBackPress={() => navigation.goBack()}
        showNext
        nextDisabled={!isValidEmail || loading}
        onNextPress={handleNext}
      />

      <Text style={styles.headerTitle}>Registration non-member</Text>
      <Text style={styles.bodyText}>
        Enter your email address to continue registration.
      </Text>

      <View style={styles.form}>
        <DefaultTextInput
          label="Email address"
          placeholder="sample@gmail.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        confirmText="OK"
        onConfirm={alertAction}
      />

      {loading && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loaderText}>Checking email...</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default NonMemberEmailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  headerTitle: {
    fontFamily: FontFamily.SemiBold,
    paddingTop: 32,
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  bodyText: {
    fontFamily: FontFamily.Medium,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: colors.loginAccountColor,
    marginTop: 6,
  },
  form: {
    marginTop: 32,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
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
