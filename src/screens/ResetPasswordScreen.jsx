import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, BackHandler, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import DefaultTextInput from "../components/DefaultTextInput";
import HeaderWithActions from "../components/HeaderWithActions";
import Screen from "../utils/Screen";
import { resetPassword } from "../controllers/MemberController";
import CustomAlertModal from "../components/CustomAlertModal";


const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const ResetPasswordScreen = ({ navigation, route }) => {
    const { email, isFromLogin } = route?.params || {}
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const isPopping = useRef(false); 
    const [loading, setLoading] = useState(false)
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

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

    const handleCofirm = () => {
        if (isFromLogin) {
            navigation.navigate(Screen.Login)
        } else {
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
            })
        }
    }



    // useEffect(() => {
    //     const unsubscribe = navigation.addListener("beforeRemove", (e) => {
    //         if (isPopping.current) {
    //             isPopping.current = false;
    //             return;
    //         }

    //         e.preventDefault();

    //         isPopping.current = true;

    //         navigation.pop(3);

    //     });

    //     return unsubscribe;
    // }, [navigation]);

    const isValid =
        newPassword.trim().length >= 4 &&
        confirmPassword.trim().length >= 4 &&
        newPassword === confirmPassword;

    const handleChangePassword = async () => {
        if (!isValid) return;
        const postBody = {
            email: email,
            newPassword: newPassword
        }
        try {
            setLoading(true);
            fadeInOverlay();
            console.log("Postbody", postBody)
            const response = await resetPassword(postBody)
            console.log(response)
            if (response?.success) {
                setAlertMessage("Password Reset Successfully");
                setAlertVisible(true);
            }
        } catch (err) {
            console.log(err)
        } finally {
            fadeOutOverlay()
            setLoading(false)
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <HeaderWithActions
                onBackPress={() => navigation.pop(3)}
            />
            <Text style={styles.headerTitle}>Change password</Text>
            <Text style={styles.bodyText}>
                Enter a new password below to change your password.
            </Text>

            {/* Inputs */}
            <View style={{ marginVertical: 28 }}>
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
                onConfirm={handleCofirm}
            />
        </SafeAreaView>
    );
};

export default ResetPasswordScreen;

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
