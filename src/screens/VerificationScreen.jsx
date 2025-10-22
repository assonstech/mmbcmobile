import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HeaderWithActions from "../components/HeaderWithActions";
import { OtpInput } from "react-native-otp-entry";
import Screen from "../utils/Screen";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const VerificationScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const [otp, setOtp] = useState("");
  const [isValidOtp, setIsValidOtp] = useState(false);

  const handleOtpChange = (value) => {
    setOtp(value);
    setIsValidOtp(value?.length === 6); // ✅ only true when 6 digits
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithActions
        onBackPress={() => navigation.goBack()}
        showNext={true}
        nextDisabled={!isValidOtp} // ✅ disable until OTP complete
        onNextPress={() => {
          console.log("OTP Verified:", otp);
          navigation.navigate(Screen.ResetPasswordScreen);
        }}
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

      <Text style={styles.resendText}>
        Didn’t receive the code?{" "}
        <Text style={styles.resendLink}>Resend Code</Text>
      </Text>
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
  resendText: {
    fontFamily: FontFamily.Medium,
    color: colors.loginAccountColor,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    marginTop: 24,
  },
  resendLink: {
    color: colors.signUpTextColor,
    fontFamily: FontFamily.SemiBold,
  },
});
