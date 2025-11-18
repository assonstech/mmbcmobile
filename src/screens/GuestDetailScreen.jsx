import React, { useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    ActivityIndicator,
    Switch,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HeaderWithActions from "../components/HeaderWithActions";
import Screen from "../utils/Screen";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const GuestDetailScreen = ({ navigation, route }) => {
    const { onFinish, isMemberInclude: initialMemberInclude, guestData, eventId, registrationId, isEditAllow } = route?.params || {};
    console.log(isEditAllow)

    const initialGuests =
        Array.isArray(guestData) && guestData.length > 0
            ? guestData.map((g) => ({
                name: g.guestName || "",
                email: g.guestEmail || "",
                phone: g.guestPhone || "",
            }))
            : [];

    const [guests, setGuests] = useState(initialGuests);
    const [isMemberInclude, setIsMemberInclude] = useState(
        !!initialMemberInclude
    );

    const handleNextPress = () => {
        navigation.navigate(Screen.GuestScreen, { isMemberInclude: isMemberInclude, registrationId: registrationId,initialMemberInclude:initialMemberInclude,eventId:eventId, guestData: guestData , onFinish: onFinish});
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <SafeAreaView style={styles.container}>
                <HeaderWithActions
                    onBackPress={() => navigation.goBack()}
                    showNext={isEditAllow}
                    buttonText={"Edit"}
                    onNextPress={handleNextPress}
                />

                <Text style={styles.headerTitle}>Guest list</Text>
                <Text style={styles.bodyText}>
                    You can check guest list who you’ve invited.
                </Text>

                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>
                        Include myself in registration
                    </Text>
                    <Switch
                        value={isMemberInclude}
                        trackColor={{ false: "#ccc", true: "#007AFF" }}
                        thumbColor={isMemberInclude ? "#fff" : "#f4f3f4"}
                    />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {guests.map((guest, index) => (
                        <View style={styles.card} key={index}>
                            <Text style={styles.guestNumber}>
                                Guest {index + 1}
                            </Text>

                            <Text style={styles.guestName}>{guest.name}</Text>

                            <View style={styles.row}>
                                <Image
                                    source={require("../assets/icons/endo-sms.png")}
                                    style={styles.icon}
                                />
                                <Text style={styles.infoText}>
                                    {guest.email}
                                </Text>
                            </View>

                            <View style={styles.row}>
                                <Image
                                    source={require("../assets/icons/endo-call.png")}
                                    style={styles.icon}
                                />
                                <Text style={styles.infoText}>
                                    {guest.phone}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default GuestDetailScreen;

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
        color: colors.loginAccountColor,
    },

    bodyText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: "500",
        lineHeight: 24,
        color: colors.loginAccountColor,
        marginTop: 6,
    },

    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },

    switchLabel: {
        fontSize: 16,
        fontFamily: FontFamily.Medium,
        color: colors.text,
    },

    /** Guest Card (🔥 Matches your screenshot) */
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
        marginTop: 24,
    },

    guestNumber: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 14,
        color: colors.loginAccountColor,
        lineHeight:20,
        marginBottom: 8,
    },

    guestName: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
        color: "#000",
        lineHeight:26
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },

    icon: {
        width: 22,
        height: 22,
        marginRight: 10,
        tintColor: "#000", // keeps icon sharp
    },

    infoText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: "#000",
        fontWeight:'500',
        lineHeight:24
    },

    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255,255,255,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },

    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#333",
    },
});
