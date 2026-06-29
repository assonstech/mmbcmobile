import React, { useRef, useState } from "react";
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HeaderWithActions from "../components/HeaderWithActions";
import { SafeAreaView } from "react-native-safe-area-context";
import DefaultTextInput from "../components/DefaultTextInput";
import DefaultButton from "../components/DefaultButton";
import { updateAcccountDeleteStatus } from "../controllers/MemberController";
import HttpSerivce from "../common/HttpSerivce";
import Screen from "../utils/Screen";
import { logoutOneSignal } from "../notifications/useNotification";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const DeleteAccountScreen = () => {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);

    const overlayOpacity = useRef(new Animated.Value(0)).current;

    const fadeInOverlay = () =>
        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();

    const fadeOutOverlay = () =>
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();

    const navigation = useNavigation();

    // Validate email on button click
    const validateOnSubmit = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            setEmailError("Email is required.");
            return false;
        }

        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address.");
            return false;
        }

        setEmailError("");
        return true;
    };

    const onDeletePress = async () => {
        const isValid = validateOnSubmit();
        if (!isValid) return;

        setLoading(true);
        fadeInOverlay();

        try {
            const postBody = {
                status: "Deleted",
                email: email,
            };

            const response = await updateAcccountDeleteStatus(postBody);
            if (response?.success) {
                await HttpSerivce.removeAccessToken();
                logoutOneSignal();
                // Correct way to reset & navigate to login screen
                navigation.reset({
                    index: 0,
                    routes: [{ name: Screen.Login }],
                });
            } else if (response?.message && response.message.toString().includes("400")) {
                setEmailError("Your mail doesn’t match your account.");
            } else {
                setEmailError("Something went wrong.");
            }
        } catch (error) {
            console.error("Delete account error:", error);
            setEmailError("Unable to delete account. Please try again.");
        } finally {
            setLoading(false);
            fadeOutOverlay();
        }
    };


    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <SafeAreaView style={styles.container}>
                <HeaderWithActions onBackPress={() => navigation.goBack()} />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}>
                    <Text style={styles.headerTitle}>Delete Policy</Text>

                    {/* POLICY TEXT */}
                    <Text style={styles.bodyText}>
                        Are you sure you want to delete your account?
                    </Text>

                    <Text style={styles.bodyText}>
                        By selecting <Text style={styles.bold}>“Delete Account”</Text>, you understand that this action is permanent.
                        All account data, settings, and registered history will be permanently deleted
                        and cannot be recovered.
                    </Text>

                    <Text style={styles.bodyText}>
                        If you wish to use the MMBC App again in the future, you will need to create a new account.
                    </Text>

                    <Text style={styles.bodyText}>
                        For assistance, please contact the MMBC Secretariat at{" "}
                        <Text style={styles.bold}>09971988989</Text>.
                    </Text>

                    {/* Email Input */}
                    <DefaultTextInput
                        label="Email Address"
                        placeholder="sample@gmail.com"
                        value={email}
                        onChangeText={(val) => {
                            setEmail(val);
                            setEmailError(""); // Clear error while typing
                        }}
                    />

                    {/* Error Message */}
                    {emailError ? (
                        <Text style={styles.errorText}>{emailError}</Text>
                    ) : null}

                    {/* Submit Button */}
                    <DefaultButton
                        title="Delete Account"
                        onPress={onDeletePress}
                        disabled={loading}
                        style={{ marginTop: 20 }}
                    />
                </ScrollView>
                {loading && (
                    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                        <View style={styles.loaderBox}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Text style={styles.loaderText}>Deleting ...</Text>
                        </View>
                    </Animated.View>
                )}
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default DeleteAccountScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 16,
    },
    headerTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 24,
        fontWeight: "600",
        color: colors.text,
        paddingTop: 16,
        marginBottom: 16,
    },
    bodyText: {
        fontFamily: FontFamily.Regular,
        fontSize: 16,
        lineHeight: 24,
        color: colors.text,
        marginBottom: 12,
    },
    bold: {
        fontFamily: FontFamily.SemiBold,
        fontWeight: "600",
        color: colors.text,
    },
    errorText: {
        color: "#EF4444",
        fontSize: 14,
        marginTop: -8,
        marginBottom: 10,
        fontFamily: FontFamily.Regular,
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
