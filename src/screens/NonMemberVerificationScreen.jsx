import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OtpInput } from "react-native-otp-entry";
import HeaderWithActions from "../components/HeaderWithActions";
import CustomAlertModal from "../components/CustomAlertModal";
import CustomToast from "../components/CustomToast";
import { FontFamily } from "../styles/fontStyle";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import Screen from "../utils/Screen";
import {
  sendNonMemberOTP,
  verifyNonMemberOTP,
} from "../controllers/NonMemberController";
import HttpSerivce from "../common/HttpSerivce";
import { setNonMemberProfile } from "../utils/auth";
import { loginOneSignalWithToken } from "../notifications/useNotification";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const NonMemberVerificationScreen = ({ navigation, route }) => {
  const { email, representiveName, phone } = route.params || {};
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const isValidOtp = otp?.length === 6;

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

  const formatTimer = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleResend = async () => {
    if (!canResend || loading) return;

    try {
      setLoadingText("Sending OTP...");
      setLoading(true);
      fadeInOverlay();
      const response = await sendNonMemberOTP(email);
      if (response?.success) {
        setTimer(300);
        setCanResend(false);
        showToast("OTP resent successfully", "success");
      } else {
        showToast(response?.message || "Failed to resend OTP", "error");
      }
    } finally {
      fadeOutOverlay();
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!isValidOtp || loading) return;

    try {
      setLoadingText("Verifying OTP...");
      setLoading(true);
      fadeInOverlay();
      const response = await verifyNonMemberOTP({
        email,
        otp: otp.trim(),
        representiveName,
        phone,
      });

      const responseData = response?.data || {};
      const token = responseData?.token || response?.token;
      const isVerified = response?.success === true || !!token;

      if (isVerified) {
        if (token) {
          await HttpSerivce.setAccessToken(token);
          loginOneSignalWithToken(token);
        }
        await setNonMemberProfile(responseData);
        setSuccessVisible(true);
      } else {
        showToast(response?.message || "Invalid OTP code", "error");
      }
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
        nextDisabled={!isValidOtp || loading}
        onNextPress={verifyOtp}
      />

      <Text style={styles.headerTitle}>Verification code</Text>
      <Text style={styles.bodyText}>
        We have sent a code to {"\n"}
        {email || "your email"}
      </Text>

      <View style={styles.otpContainer}>
        <OtpInput
          numberOfDigits={6}
          focusColor={colors.text}
          onTextChange={setOtp}
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
            Resend in {formatTimer(timer)}
          </Text>
        )}
      </View>

      <CustomToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      <CustomAlertModal
        visible={successVisible}
        title="Verified"
        message="Continue as non-member successful."
        confirmText="OK"
        onConfirm={() => {
          setSuccessVisible(false);
          navigation.reset({
            index: 0,
            routes: [{ name: Screen.MainTabs }],
          });
        }}
      />

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

export default NonMemberVerificationScreen;

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
    alignSelf: "center",
  },
  otpBox: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.itemSeparateColor,
    width: 53,
    justifyContent: "center",
    height: 56,
    marginHorizontal: 2,
  },
  otpText: {
    fontSize: 20,
    color: "#000",
    fontFamily: FontFamily.Medium,
  },
  resendContainer: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  resendText: {
    color: colors.loginAccountColor,
    fontFamily: FontFamily.Medium,
    fontSize: 15,
  },
  resendLink: {
    color: colors.signUpTextColor,
    fontFamily: FontFamily.SemiBold,
    fontSize: 15,
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
