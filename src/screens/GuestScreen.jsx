import React, { useCallback, useEffect, useState } from "react";
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
import { registerEvent, updateAttandence } from "../controllers/EventController";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const GuestScreen = ({ navigation, route }) => {
    const { onFinish, isMemberInclude: initialMemberInclude, guestData, eventId, registrationId } = route?.params || {};

    const initialGuests = Array.isArray(guestData) && guestData.length > 0
        ? guestData.map(g => ({
            name: g.guestName || "",
            email: g.guestEmail || "",
            phone: g.guestPhone || "",
        }))
        : [{ name: "", email: "", phone: "" }];

    const [guests, setGuests] = useState(initialGuests);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isMemberInclude, setIsMemberInclude] = useState(!!initialMemberInclude);
    const [activeGuests, setActiveGuests] = useState(1);
    const [isFormValid, setIsFormValid] = useState(false);

    const validateGuests = useCallback(() => {
        return guests.slice(0, activeGuests).every(
            g => g.name.trim() !== "" &&
                g.email.trim() !== "" &&
                g.phone.trim() !== ""
        );
    }, [activeGuests, guests]);

    useEffect(() => {
        setIsFormValid(validateGuests());
    }, [validateGuests]);


    useEffect(() => {
        if (Array.isArray(guestData) && guestData.length > 0) setIsUpdateMode(true);
        else setIsUpdateMode(false);
    }, [guestData]);

    const handleInputChange = (index, field, value) => {
        const updatedGuests = [...guests];
        updatedGuests[index][field] = value;
        setGuests(updatedGuests);

        if (index + 1 > activeGuests) {
            setActiveGuests(index + 1);
        }
    };



    const handleAddGuest = () => {
        if (guests.length >= 3) return;

        const newTotal = guests.length + 1;

        setGuests([...guests, { name: "", email: "", phone: "" }]);

        setActiveGuests(newTotal);
    };



    const handleRemoveGuest = (index) => {
        const updatedGuests = guests.filter((_, i) => i !== index);
        setGuests(updatedGuests);
    };


    const register = async () => {
        setError("");
        setLoading(true);

        const payload = {
            eventId: eventId,
            isMemberInclude: !!isMemberInclude,
            guests: guests.map(g => ({
                guestName: g.name,
                guestEmail: g.email,
                guestPhone: g.phone,
            })),
        };


        try {
            const res = await registerEvent(payload);

            if (res.success) {
                if (onFinish) onFinish();
                navigation.pop(2);
            } else {
                setError(res.message || "Failed to register event");
            }
        } catch (err) {
            console.error("registerEvent error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const update = async () => {
        setError("");
        setLoading(true);

        const payload = {
            registrationId: registrationId,
            isMemberInclude: !!isMemberInclude,
            guests: guests.map(g => ({
                guestName: g.name,
                guestEmail: g.email,
                guestPhone: g.phone,
            })),
        };

        try {
            const res = await updateAttandence(payload);

            if (res.success) {
                if (onFinish) onFinish();
                navigation.pop(2);
            } else {
                setError(res.message || "Failed to update event");
            }
        } catch (err) {
            console.error("registerEvent error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const handleNextPress = async () => {
        if (isUpdateMode) update();
        else register();
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <SafeAreaView style={styles.container}>
                <HeaderWithActions
                    onBackPress={() => navigation.goBack()}
                    showNext={!loading && isFormValid}
                    buttonText={isUpdateMode ? "Update" : "Register"}
                    onNextPress={handleNextPress}
                />

                <Text style={styles.headerTitle}>
                    Register For <Text style={{ color: colors.text }}>Others</Text>
                </Text>
                <Text style={styles.bodyText}>
                    This registration is for{isMemberInclude && " you and"} other people. You’ll need to attend the event.
                </Text>

                {/* Switch for including member */}
                {isUpdateMode && (
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Include myself in registration</Text>
                        <Switch
                            value={isMemberInclude}
                            onValueChange={setIsMemberInclude}
                            trackColor={{ false: "#ccc", true: colors.primary || "#007AFF" }}
                            thumbColor={isMemberInclude ? "#fff" : "#f4f3f4"}
                        />
                    </View>
                )}


                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {guests.map((guest, index) => (
                        <View style={styles.guestCard} key={index}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={styles.guestTitle}>Guest {index + 1}</Text>
                                {index !== 0 && (
                                    <TouchableOpacity onPress={() => handleRemoveGuest(index)}>
                                        <Text style={{ color: "red", fontWeight: "600" }}>Remove</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter name"
                                value={guest.name}
                                onChangeText={(text) => handleInputChange(index, "name", text)}
                            />

                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email"
                                keyboardType="email-address"
                                value={guest.email}
                                onChangeText={(text) => handleInputChange(index, "email", text)}
                            />

                            <Text style={styles.label}>Phone</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                                value={guest.phone}
                                onChangeText={(text) => handleInputChange(index, "phone", text)}
                            />
                        </View>
                    ))}
                    {guests.length < 3 && (
                        <TouchableOpacity style={styles.button} onPress={handleAddGuest}>
                            <Image
                                source={require("../assets/icons/endo-add.png")}
                                style={styles.buttonIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.buttonText}>Add Guest</Text>
                        </TouchableOpacity>
                    )}

                </ScrollView>

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary || "#007AFF"} />
                        <Text style={styles.loadingText}>{isUpdateMode ? "Updating..." : "Registering..."}</Text>
                    </View>
                )}

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </SafeAreaView>
        </KeyboardAvoidingView >

    );
};

export default GuestScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white", padding: 16 },
    headerTitle: { fontFamily: FontFamily.SemiBold, paddingTop: 32, fontSize: 24, fontWeight: "600", color: colors.loginAccountColor },
    bodyText: { fontFamily: FontFamily.Medium, fontSize: 16, fontWeight: "500", lineHeight: 24, color: colors.loginAccountColor, marginTop: 6 },
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
    guestCard: { marginTop: 24, padding: 16, backgroundColor: colors.itemSeparateColor, borderRadius: 12, gap: 8 },
    guestTitle: { fontFamily: FontFamily.SemiBold, fontSize: 16, fontWeight: "600", marginBottom: 12, lineHeight: 24, color: colors.loginAccountColor },
    label: { fontFamily: FontFamily.Medium, fontSize: 14, fontWeight: "500", marginTop: 8, lineHeight: 20, marginBottom: 4, color: colors.text },
    input: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 16, fontSize: 16, backgroundColor: "#fff", fontFamily: FontFamily.Medium, fontWeight: '500', lineHeight: 24 },
    button: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 9999, borderWidth: 1, marginTop: 24 },
    buttonIcon: { width: 24, height: 24, marginRight: 8 },
    buttonText: { fontSize: 16, fontFamily: FontFamily.Medium, color: colors.text, fontWeight: "500", lineHeight: 24 },
    loadingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.7)", alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 12, fontSize: 16, color: "#333", fontFamily: FontFamily.Medium },
    errorText: { fontFamily: FontFamily.Medium, fontSize: 14, color: "#D32F2F", marginTop: 12, textAlign: "center" },
});
