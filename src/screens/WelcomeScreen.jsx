import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import Screen from "../utils/Screen";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const WelcomeScreen = ({ navigation }) => {
    const logoPosition = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(1)).current;
    const cardPosition = useRef(new Animated.Value(50)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const secondLogoOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(logoPosition, {
                    toValue: -SCREEN_HEIGHT / 3.2,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(logoScale, {
                    toValue: 0.65,
                    useNativeDriver: true,
                }),
                Animated.timing(cardPosition, {
                    toValue: 70,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(cardOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(secondLogoOpacity, {
                    toValue: 0.5,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 700);

        return () => clearTimeout(timeout);
    }, [cardOpacity, cardPosition, logoPosition, logoScale, secondLogoOpacity]);

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View
                style={[
                    styles.secondLogoContainer,
                    { opacity: secondLogoOpacity },
                ]}
            >
                <Image
                    source={require("../assets/images/appLogo.png")}
                    style={styles.secondLogo}
                />
            </Animated.View>

            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        transform: [
                            { translateY: logoPosition },
                            { scale: logoScale },
                        ],
                    },
                ]}
            >
                <Image
                    source={require("../assets/images/appLogo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity: cardOpacity,
                            transform: [{ translateY: cardPosition }],
                        },
                    ]}
                >
                    <Text style={styles.title}>Welcome to MMBC</Text>
                    <Text style={styles.subtitle}>
                        Please login with your email. If you don't have an account, please register.
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate(Screen.Login)}
                    >
                        <Text style={styles.primaryButtonText}>Login With Email</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.divider} />
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate(Screen.SignUp, { registrationType: "member" })}
                    >
                        <Text style={styles.secondaryButtonText}>Registration member</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate(Screen.NonMemberEmail)}
                    >
                        <Text style={styles.secondaryButtonText}>Registration non-member</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    secondLogoContainer: {
        ...StyleSheet.absoluteFill,
        marginTop: "15%",
        alignItems: "center",
        zIndex: 0,
    },
    secondLogo: {
        opacity: 0.14,
        width: 361,
        height: 361,
        resizeMode: "contain",
    },
    logoContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 0,
    },
    logo: {
        width: "80%",
        height: "80%",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "flex-end",
        paddingBottom: 50,
    },
    card: {
        width: "95%",
        alignSelf: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 28,
        paddingBottom: 42,
        alignItems: "center",
        minHeight: 520,
        zIndex: 1,
    },
    title: {
        color: colors.text,
        fontFamily: FontFamily.Bold,
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        color: colors.loginAccountColor,
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: "500",
        lineHeight: 24,
        textAlign: "center",
        marginBottom: 44,
    },
    primaryButton: {
        width: "100%",
        height: 58,
        borderRadius: 29,
        backgroundColor: "#FDBA12",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 44,
    },
    primaryButtonText: {
        color: "#180A10",
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: "500",
    },
    dividerRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 42,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#E5E7EB",
    },
    dividerText: {
        color: "#98A0B3",
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: "500",
        marginHorizontal: 18,
    },
    secondaryButton: {
        width: "100%",
        height: 58,
        borderRadius: 29,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 18,
    },
    secondaryButtonText: {
        color: "#180A10",
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: "500",
    },
});
