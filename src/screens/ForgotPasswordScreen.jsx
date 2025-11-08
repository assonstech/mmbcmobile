import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import DefaultTextInput from "../components/DefaultTextInput";
import CustomAlertModal from "../components/CustomAlertModal";
import HeaderWithActions from "../components/HeaderWithActions";
import Screen from "../utils/Screen";
import { sendOTP } from "../controllers/OTPController";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // ✅ Email validation regex
  const validateEmail = (text) => /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(text.trim());
  const isValid = validateEmail(email);

  // Animate overlay fade-in
  const fadeInOverlay = () => {
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Animate overlay fade-out
  const fadeOutOverlay = () => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleNextPress = async () => {
    if (!isValid) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");


    try {
      setLoading(true);
      fadeInOverlay();

      const response = await sendOTP(email);

      if (response?.success) {
        navigation.navigate(Screen.VerificationScreen, { email });
      } else {
        setAlertMessage(response?.message || "Failed to send OTP. Please try again.");
        setAlertVisible(true);
      }
    } catch (err) {
      console.log("sendOTP error:", err);
      setAlertMessage("Something went wrong. Please check your connection and try again.");
      setAlertVisible(true);
    } finally {
      fadeOutOverlay();
      setLoading(false);
    }


  };

  return (<SafeAreaView style={styles.container}>
    <HeaderWithActions
      onBackPress={() => navigation.goBack()}
      showNext={true}
      nextDisabled={!isValid}
      onNextPress={handleNextPress}
    />


    <Text style={styles.headerTitle}>Forgot your password</Text>
    <Text style={styles.bodyText}>
      Enter your email and we’ll send you an OTP code.
    </Text>

    <View style={{ marginVertical: 28 }}>
      <DefaultTextInput
        label="Email Address"
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (error) setError("");
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>

    {/* Loading Overlay */}
    {loading && (
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loaderText}>Sending OTP...</Text>
        </View>
      </Animated.View>
    )}

    <CustomAlertModal
      visible={alertVisible}
      message={alertMessage}
      onClose={() => setAlertVisible(false)}
    />
  </SafeAreaView>


  );
};

export default ForgotPasswordScreen;

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
  errorText: {
    fontFamily: FontFamily.Medium,
    fontSize: 14,
    color: "#D32F2F",
    marginTop: 4,
    marginLeft: 4,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
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
