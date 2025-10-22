import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HeaderWithActions from "../components/HeaderWithActions";


const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const PrivacyPolicyScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <HeaderWithActions
                onBackPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Privacy policy</Text>
            <Text style={styles.bodyText}>Effective date: 31/09/2025</Text>


            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.placeholderText}>
                    At [Your App Name], your privacy is important to us. We collect personal information such as your name, email, and usage data to provide a better user experience, improve our services, and communicate important updates. Your data is stored securely and is never sold to third parties. We may share it only with trusted partners or when required by law. You have the right to access, update, or delete your information at any time. By using our app, you agree to this Privacy Policy. For any concerns, please contact us at support@yourapp.com.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16
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
        fontWeight: '500',
        lineHeight: 24,
        color: colors.loginAccountColor
    },
    content: {
        flex: 1,
        paddingVertical: 16,
    },
    placeholderText: {
        fontFamily: FontFamily.Regular,
        fontWeight: '400',
        lineHeight: 24,
        fontSize: 16,
        color: colors.text,
    },
});
