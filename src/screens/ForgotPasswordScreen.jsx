import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import DefaultTextInput from "../components/DefaultTextInput";
import CustomAlertModal from "../components/CustomAlertModal";
import HeaderWithActions from "../components/HeaderWithActions";
import Screen from "../utils/Screen";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // ✅ Email validation regex
  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text.trim());
  };

  const isValid = validateEmail(email);

  const handleNextPress = () => {
    if (!isValid) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    navigation.navigate(Screen.VerificationScreen, { email });
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithActions
        onBackPress={() => navigation.goBack()}
        showNext={true}
        nextDisabled={!isValid}
        onNextPress={handleNextPress}
      />

      <Text style={styles.headerTitle}>Forgot your password</Text>
      <Text style={styles.bodyText}>
        Enter your email and we’ll send you a OTP code.
      </Text>

      {/* Inputs */}
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

        {/* Show validation error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
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
});
