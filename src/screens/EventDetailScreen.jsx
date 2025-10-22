import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
    Image,
    Animated,
    Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HeaderWithActions from "../components/HeaderWithActions";
import { FontFamily } from "../styles/fontStyle";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";

import EndoVieo from "../assets/icons/endo-video.png";
import EndoCalendar from "../assets/icons/endo-calendar.png";
import EndoClock from "../assets/icons/endo-clock.png";

import { fetchEventDetail } from "../controllers/EventController";
import { getFullImageUrl } from "../common/HttpSerivce";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const EventDetailScreen = ({ navigation, route }) => {
    const { item } = route?.params || {};
    const [eventDetail, setEventDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    const shimmerAnim = new Animated.Value(0);

    useEffect(() => {
        startShimmer();
        if (item?.id) fetchEventDetailById();
    }, [item?.id]);

    const startShimmer = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.linear,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.linear,
                }),
            ])
        ).start();
    };

    const fetchEventDetailById = async () => {
        try {
            setLoading(true);
            const response = await fetchEventDetail(item?.id);
            if (response?.success && response?.data?.event) {
                setEventDetail(response.data);
            }
        } catch (err) {
            console.log("Error fetching event detail:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleButtonPress = () => {
        if (eventDetail?.isRegistered) {
            console.log("Cancel Registration");
        } else {
            navigation.navigate("EventRegister", { event: eventDetail.event });
        }
    };

    const handleGuestPress = () => {
        navigation.navigate("GuestListScreen", { guests: eventDetail.guests || [] });
    };

    // Custom Skeleton Component
    const SkeletonBlock = ({ width, height, style }) => {
        const translateX = shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-width, width],
        });

        return (
            <View
                style={[
                    {
                        backgroundColor: colors.itemSeparateColor,
                        overflow: "hidden",
                        borderRadius: 4,
                        width,
                        height,
                        marginVertical: 4,
                    },
                    style,
                ]}
            >
                <Animated.View
                    style={{
                        width: "50%",
                        height: "100%",
                        backgroundColor: "#e0e0e0",
                        transform: [{ translateX }],
                        opacity: 0.5,
                    }}
                />
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ paddingTop: 16,paddingHorizontal:16 }}>
                    <HeaderWithActions title="Event Detail" onBackPress={() => navigation.goBack()} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ScrollView
                        contentContainerStyle={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingBottom: 0,
                        }}
                    >
                        <SkeletonBlock width={300} height={221} style={{ borderRadius: 16, marginBottom: 16 }} />
                        <SkeletonBlock width={200} height={28} style={{ marginBottom: 12 }} />
                        <SkeletonBlock width={150} height={20} style={{ marginBottom: 8 }} />
                        <SkeletonBlock width={250} height={16} style={{ marginBottom: 8 }} />
                        <SkeletonBlock width={180} height={16} style={{ marginBottom: 8 }} />
                        <SkeletonBlock width={120} height={16} style={{ marginBottom: 16 }} />
                        <SkeletonBlock width={300} height={120} style={{ marginBottom: 16 }} />
                        <SkeletonBlock width={300} height={80} style={{ borderRadius: 16 }} />
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }


    if (!eventDetail) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <Text>No event details found.</Text>
            </View>
        );
    }

    const { event, isRegistered, guests } = eventDetail;

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <HeaderWithActions title="Event Detail" onBackPress={() => navigation.goBack()} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.imageContainer}>
                    <ImageBackground
                        source={{ uri: getFullImageUrl(event.eventImage) }}
                        style={styles.image}
                        resizeMode="cover"
                    >
                        <View style={styles.overlay} />
                        <View style={styles.ruleContainer}>
                            <Text style={styles.ruleText}>{event.eventRule || "No rules provided"}</Text>
                        </View>
                    </ImageBackground>
                </View>

                <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                    <Text style={styles.title}>{event.eventTitle}</Text>
                    <Text style={styles.location}>{event.eventLocation}</Text>

                    <View style={styles.row}>
                        <Image source={EndoCalendar} style={styles.icon} />
                        <Text style={styles.infoText}>{new Date(event.eventDate).toDateString()}</Text>
                    </View>

                    <View style={styles.row}>
                        <Image source={EndoClock} style={styles.icon} />
                        <Text style={styles.infoText}>9:00 AM - 5:00 PM</Text>
                    </View>

                    <View style={styles.row}>
                        <Image source={EndoVieo} style={styles.icon} />
                        <Text style={styles.infoText}>{event.eventType === "inPerson" ? "In-Person" : "Online"}</Text>
                    </View>

                    <Text style={styles.priceText}>
                        💰 {event.eventFee ? `${event.eventFee} Ks (${event.feeType})` : "Free"}
                    </Text>
                </View>

                {isRegistered && guests?.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.guestHeaderRow}>
                            <Text style={styles.sectionTitle}>Other Guests: {guests.length}</Text>
                            <TouchableOpacity onPress={handleGuestPress}>
                                <Image
                                    source={require("../assets/icons/endo-arrow-right-01.png")}
                                    style={styles.arrowIcon}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.description}>{event.eventDescription || "No description available."}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={[
                        styles.bottomButton,
                        {
                            backgroundColor: isRegistered ? colors.cancelButton || "#E53935" : colors.button,
                        },
                    ]}
                    onPress={handleButtonPress}
                >
                    <Text
                        style={[
                            styles.bottomButtonText,
                            { color: isRegistered ? "#fff" : colors.text },
                        ]}
                    >
                        {isRegistered ? "Cancel Registration" : "Register Now"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    imageContainer: { width: "100%", height: 221, overflow: "hidden"},
    image: { flex: 1, justifyContent: "flex-start" },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
    ruleContainer: { backgroundColor: colors.ruleBackgroundColor },
    ruleText: { textAlign: "center", fontFamily: FontFamily.Medium, fontWeight: "500", lineHeight: 20, color: "#fff", fontSize: 14, paddingVertical: 8 },
    card: { marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 16, backgroundColor: colors.itemSeparateColor },
    title: { fontFamily: FontFamily.SemiBold, fontSize: 24, fontWeight: "600", lineHeight: 32, color: colors.text, paddingVertical: 8 },
    location: { fontFamily: FontFamily.Medium, fontSize: 16, color: colors.text, fontWeight: "500", lineHeight: 24, marginBottom: 8 },
    row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    icon: { width: 22, height: 22, resizeMode: "contain", marginRight: 8, tintColor: colors.text },
    infoText: { fontFamily: FontFamily.Medium, fontSize: 15, color: colors.text },
    priceText: { marginTop: 6, fontFamily: FontFamily.Medium, fontSize: 15, color: colors.text },
    sectionTitle: { fontFamily: FontFamily.Medium, fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 6 },
    descriptionContainer: { borderTopColor: colors.itemSeparateColor, paddingTop: 10 },
    description: { fontFamily: FontFamily.Medium, fontSize: 16, fontWeight: "500", lineHeight: 24, color: colors.text },
    guestHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    arrowIcon: { width: 18, height: 18, resizeMode: "contain" },
    bottomButtonContainer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", padding: 16, borderTopWidth: 1, borderTopColor: colors.itemSeparateColor },
    bottomButton: { borderRadius: 9999, paddingVertical: 14, alignItems: "center" },
    bottomButtonText: { fontFamily: FontFamily.SemiBold, fontSize: 16 },

    // Skeleton Styles
    imageContainerSkeleton: { width: "100%", height: 221, borderRadius: 16, backgroundColor: colors.itemSeparateColor },
});
