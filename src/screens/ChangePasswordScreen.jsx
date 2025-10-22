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

const ChangePasswordScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    const isValid =
        currentPassword.trim().length > 0 &&
        newPassword.trim().length >= 6 &&
        confirmPassword.trim().length >= 6 &&
        newPassword === confirmPassword;

    const handleChangePassword = () => {
        if (!isValid) return;
        console.log("Password changed successfully!");
    };

    return (
        <SafeAreaView style={styles.container}>
            <HeaderWithActions
                onBackPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Change password</Text>
            <Text style={styles.bodyText}>
                Enter a new password below to change your password.
            </Text>

            {/* Inputs */}
            <View style={{ marginVertical: 28 }}>
                <DefaultTextInput
                    label="Current Password"
                    placeholder="Enter your current password"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                />
                <DefaultTextInput
                    label="New Password"
                    placeholder="Enter your new password"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <DefaultTextInput
                    label="Confirm Password"
                    placeholder="Re-enter your new password"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                {/* ✅ Show warning if passwords don't match */}
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <Text style={styles.errorText}>Passwords do not match</Text>
                )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                onPress={handleChangePassword}
                disabled={!isValid}
                style={[
                    styles.button,
                    {
                        backgroundColor: isValid ? colors.button : colors.itemSeparateColor, // Red when invalid
                        opacity: isValid ? 1 : 0.7,
                    },
                ]}
            >
                <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <Text style={[styles.body, { alignSelf: "center", marginVertical: 8 }]} onPress={() => navigation.navigate(Screen.ForgotPassword)}>
                Forgot your password?
            </Text>
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;

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
    button: {
        height: 56,
        borderRadius: 9999,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: "500",
        lineHeight: 24,
        color: colors.text,
    },
    body: {
        fontFamily: FontFamily.Regular,
        fontSize: 16,
        lineHeight: 24,
        color: colors.loginAccountColor,
        fontWeight: "500",
    },
});
