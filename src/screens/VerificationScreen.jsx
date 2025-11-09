import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HeaderWithActions from "../components/HeaderWithActions";
import { OtpInput } from "react-native-otp-entry";
import Screen from "../utils/Screen";
import { sendOTP, verifyOTP } from "../controllers/OTPController";
import CustomToast from "../components/CustomToast";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const VerificationScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const [otp, setOtp] = useState("");
  const [isValidOtp, setIsValidOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");


  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Fade animation for overlay
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const handleOtpChange = (value) => {
    setOtp(value);
    setIsValidOtp(value?.length === 6);
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (!canResend || loading) return;
    await resendOTP();
  };

  const verifyOtp = async () => {
    try {
      setLoadingText("Verifying OTP...");
      setLoading(true);
      fadeInOverlay();
      const response = await verifyOTP(email, otp);
      console.log("respone", response)

      if (response?.success) {
        navigation.navigate(Screen.ResetPasswordScreen, {
          email: email
        });
      } else {
        showToast("Invalid OTP code" || "Failed to resend OTP ❌", "error");
      }
    } catch (err) {
      console.log("sendOTP error:", err);
      showToast("Network error. Please try again.", "error");
    } finally {
      fadeOutOverlay();
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setLoadingText("Sending OTP...");
      setLoading(true);
      fadeInOverlay();
      const response = await sendOTP(email);
      if (response?.success) {
        setTimer(60);
        setCanResend(false);
        showToast("OTP resent successfully ✅", "success");
      } else {
        showToast(response?.message || "Failed to resend OTP ❌", "error");
      }
    } catch (err) {
      console.log("sendOTP error:", err);
      showToast("Network error. Please try again.", "error");
    } finally {
      fadeOutOverlay();
      setLoading(false);
    }
  };

  // Overlay fade-in/out animation
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

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithActions
        onBackPress={() => navigation.goBack()}
        showNext={true}
        nextDisabled={!isValidOtp}
        onNextPress={verifyOtp}
      />

      <Text style={styles.headerTitle}>Verification code</Text>
      <Text style={styles.bodyText}>
        We have sent a code to {"\n"}
        {email || "your email"}
      </Text>

      {/* OTP Input */}
      <View style={styles.otpContainer}>
        <OtpInput
          numberOfDigits={6}
          focusColor={colors.text}
          onTextChange={handleOtpChange}
          textInputProps={{
            keyboardType: "numeric",
            maxLength: 6,
          }}
          theme={{
            pinCodeContainerStyle: styles.otpBox,
            pinCodeTextStyle: styles.otpText,
          }}
        />
      </View>

      {/* Resend Code Section */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn’t receive the code? </Text>
        {canResend ? (
          <TouchableOpacity onPress={handleResend} disabled={loading}>
            <Text style={[styles.resendLink, loading && { opacity: 0.6 }]}>
              {loading ? "Sending..." : "Resend Code"}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.resendLink, { opacity: 0.6 }]}>
            Resend in {timer}s
          </Text>
        )}
      </View>


      {/* ✅ Custom Toast */}
      <CustomToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      {/* ✅ Loading Overlay */}
      {loading && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loaderText}>{loadingText}</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default VerificationScreen;

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
  otpContainer: {
    marginTop: 32,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  otpBox: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.itemSeparateColor,
    width: 53,
    justifyContent: "center",
    height: 56,
    marginHorizontal: 6,
  },
  otpText: {
    fontSize: 20,
    color: "#000",
    fontFamily: FontFamily.Medium,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24, // adjust spacing if needed
  },
  resendText: {
    fontFamily: FontFamily.Medium,
    color: colors.loginAccountColor,
    fontSize: 16,
    fontWeight: "600",
  },
  resendLink: {
    color: colors.signUpTextColor,
    fontFamily: FontFamily.SemiBold,
    marginLeft: 4, // small gap between text and button
  },
  // ✅ Overlay styles
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
