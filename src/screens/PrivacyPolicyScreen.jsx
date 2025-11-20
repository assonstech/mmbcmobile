import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HeaderWithActions from "../components/HeaderWithActions";
import { SafeAreaView } from "react-native-safe-area-context";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const PrivacyPolicyScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <HeaderWithActions
                onBackPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <Text style={styles.bodyText}>Effective date: 1/12/2025</Text>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>1. Introduction</Text>
                <Text style={styles.bodyText}>
                    The MMBC App is created for MMBC members. By using the app, you agree to this Privacy Policy.
                </Text>

                <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                <Text style={styles.bodyText}>
                    • Your name, phone, email{"\n"}
                    • Profile photo and membership details{"\n"}
                    • Business information (optional){"\n"}
                    • App usage (features used, basic device info){"\n"}
                    • Event check-in data{"\n"}
                    We do not collect unnecessary or sensitive personal data.
                </Text>

                <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                <Text style={styles.bodyText}>
                    We use your information to:{"\n"}
                    • Verify your membership{"\n"}
                    • Show your digital membership card{"\n"}
                    • Enable networking with other members{"\n"}
                    • Provide event updates and resources{"\n"}
                    • Improve app performance and security{"\n"}
                    We do not sell or share your data with outside companies.
                </Text>

                <Text style={styles.sectionTitle}>4. Sharing With Other Members</Text>
                <Text style={styles.bodyText}>
                    Your basic profile (name, business, contact) is visible only to MMBC members inside the app for networking purposes.
                </Text>

                <Text style={styles.sectionTitle}>5. Security</Text>
                <Text style={styles.bodyText}>
                    We store your data securely with:{"\n"}
                    • Encrypted servers{"\n"}
                    • Access controls{"\n"}
                    • Regular monitoring{"\n"}
                    We work hard to protect your data, but no system is 100% secure.
                </Text>

                <Text style={styles.sectionTitle}>6. Your Rights</Text>
                <Text style={styles.bodyText}>
                    You can:{"\n"}
                    • View and update your profile{"\n"}
                    • Request account deletion{"\n"}
                    • Contact MMBC to correct or remove your data
                </Text>

                <Text style={styles.sectionTitle}>7. Data Retention</Text>
                <Text style={styles.bodyText}>
                    Your information is kept while your membership or account is active. If you request deletion, your data will be removed from our active systems.
                </Text>

                <Text style={styles.sectionTitle}>8. No Use by Minors</Text>
                <Text style={styles.bodyText}>
                    This app is for members 18 and above. We do not knowingly collect information from children.
                </Text>

                <Text style={styles.sectionTitle}>9. Third-Party Services</Text>
                <Text style={styles.bodyText}>
                    We may use trusted providers for hosting, analytics, or notifications. They must protect your data and cannot use it for their own purposes.
                </Text>

                <Text style={styles.sectionTitle}>10. Policy Updates</Text>
                <Text style={styles.bodyText}>
                    We may update this policy from time to time. We will notify you in the app if important changes are made.
                </Text>

                <Text style={styles.sectionTitle}>11. Contact</Text>
                <Text style={styles.bodyText}>
                    For questions or support, please contact the MMBC team.
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
        padding: 16,
    },
    headerTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 24,
        fontWeight: "600",
        color: colors.text,
        paddingTop: 16,
        marginBottom: 8,
    },
    bodyText: {
        fontFamily: FontFamily.Regular,
        fontSize: 16,
        lineHeight: 24,
        color: colors.text,
        marginBottom: 12,
    },
    sectionTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        fontWeight: "600",
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    content: {
        flex: 1,
    },
});
