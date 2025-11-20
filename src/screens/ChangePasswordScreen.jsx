import React, { useRef, useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import DefaultTextInput from "../components/DefaultTextInput";
import HeaderWithActions from "../components/HeaderWithActions";
import Screen from "../utils/Screen";
import CustomAlertModal from "../components/CustomAlertModal";
import { changePassword, updateIsDefaultPassword } from "../controllers/MemberController";
import HttpSerivce from "../common/HttpSerivce";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const ChangePasswordScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false)
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertAction, setAlertAction] = useState(() => () => setAlertVisible(false));


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


    const isValid =
        currentPassword.trim().length > 0 &&
        newPassword.trim().length >= 4 &&
        confirmPassword.trim().length >= 4 &&
        newPassword === confirmPassword;

    const handleChangePassword = async () => {
        if (!isValid) return;

        const postBody = {
            oldPassword: currentPassword,
            newPassword: confirmPassword,
        };

        try {
            setLoading(true);
            fadeInOverlay();

            const response = await changePassword(postBody);

            if (response?.success) {
                // Check local isDefaultPassword before calling API
                const isDefault = await HttpSerivce.getIsDefaultPassword(); // assume you have a getter
                if (isDefault) {
                    const updateResponse = await updateIsDefaultPassword(false);
                }

                // Always update locally
                await HttpSerivce.setIsDefaultPassword(false);

                setAlertMessage("Password changed successfully");
                setAlertVisible(true);
                setAlertAction(() => () => {
                    setAlertVisible(false);
                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: Screen.MainTabs,
                                state: {
                                    index: 2,
                                    routes: [
                                        { name: "Home" },
                                        { name: "Hub" },
                                        { name: "More" },
                                    ],
                                },
                            },
                        ],
                    });
                });
            } else {
                setAlertMessage("Current Password is incorrect");
                setAlertVisible(true);
                setAlertAction(() => () => {
                    setAlertVisible(false);
                });
            }
        } catch (err) {
            console.error("❌ Error changing password:", err);
            setAlertMessage("Something went wrong. Please try again later.");
            setAlertVisible(true);
        } finally {
            fadeOutOverlay();
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <HeaderWithActions onBackPress={() => navigation.goBack()} />
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
                                backgroundColor: isValid ? colors.button : colors.itemSeparateColor,
                                opacity: isValid ? 1 : 0.7,
                            },
                        ]}
                    >
                        <Text style={styles.buttonText}>Change Password</Text>
                    </TouchableOpacity>

                    {/* Forgot Password */}
                    <Text
                        style={[styles.body, { alignSelf: "center", marginVertical: 8 }]}
                        onPress={() => navigation.navigate(Screen.ForgotPassword)}
                    >
                        Forgot your password?
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
            {loading && (
                <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                    <View style={styles.loaderBox}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loaderText}>Changing password...</Text>
                    </View>
                </Animated.View>
            )}
            <CustomAlertModal
                visible={alertVisible}
                message={alertMessage}
                confirmText="OK"
                onConfirm={alertAction}
            />
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
