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
import { sendNonMemberOTP } from "../controllers/NonMemberController";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const NonMemberInfoScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const isValid = name.trim().length > 0 && phone.trim().length > 0;

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

  const handleNext = async () => {
    if (!isValid || loading) return;

    Keyboard.dismiss();
    setLoading(true);
    fadeInOverlay();

    try {
      const otpRes = await sendNonMemberOTP(email);
      if (!otpRes?.success) {
        setAlertMessage(otpRes?.message || "Failed to send OTP. Please try again.");
        setAlertVisible(true);
        return;
      }

      navigation.navigate(Screen.NonMemberVerification, {
        email,
        representiveName: name.trim(),
        phone: phone.trim(),
      });
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
        nextDisabled={!isValid || loading}
        onNextPress={handleNext}
      />

      <Text style={styles.headerTitle}>Your information</Text>
      <Text style={styles.bodyText}>
        This email is not registered yet. Please enter your name and phone number.
      </Text>

      <View style={styles.emailBox}>
        <Text style={styles.emailLabel}>Email</Text>
        <Text style={styles.emailText}>{email}</Text>
      </View>

      <View style={styles.form}>
        <DefaultTextInput
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
        <DefaultTextInput
          label="Phone"
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

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
            <Text style={styles.loaderText}>Sending OTP...</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default NonMemberInfoScreen;

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
  emailBox: {
    backgroundColor: colors.itemSeparateColor,
    borderRadius: 16,
    padding: 16,
    marginTop: 28,
  },
  emailLabel: {
    fontFamily: FontFamily.Medium,
    fontSize: 13,
    color: colors.loginAccountColor,
    marginBottom: 4,
  },
  emailText: {
    fontFamily: FontFamily.Medium,
    fontSize: 16,
    color: colors.text,
  },
  form: {
    marginTop: 24,
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
