import React, { useEffect, useState, useRef } from "react";
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
    Modal,
    ActivityIndicator,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HeaderWithActions from "../components/HeaderWithActions";
import { FontFamily } from "../styles/fontStyle";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";

import EndoVieo from "../assets/icons/endo-video.png";
import EndoCalendar from "../assets/icons/endo-calendar.png";
import EndoClock from "../assets/icons/endo-clock.png";

import { fetchEventDetail, unRegisterEvent } from "../controllers/EventController";
import { formattedPrice, getFullImageUrl } from "../common/HttpSerivce";
import Screen from "../utils/Screen";
import ImageViewing from "react-native-image-viewing";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const EventDetailScreen = ({ navigation, route }) => {
    const { item } = route?.params || {};
    const [eventDetail, setEventDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [imageViewerImages, setImageViewerImages] = useState([]);
    const [processing, setProcessing] = useState(false);



    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        startShimmer();
        if (item?.id) fetchEventDetailById(true);
    }, [item?.id]);

    const startShimmer = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true, easing: Easing.linear }),
                Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true, easing: Easing.linear }),
            ])
        ).start();
    };

    // Determine if event date is today or in the past
    // const isEventPastOrToday = () => {
    //     if (!event?.eventDate) return true; // hide if no date
    //     const eventDate = new Date(event.eventDate);
    //     const today = new Date();

    //     // Normalize both dates to remove time
    //     eventDate.setHours(0, 0, 0, 0);
    //     today.setHours(0, 0, 0, 0);

    //     return eventDate <= today; // true if event is today or before
    // };
    const isEventAllowedToRegister = () => {
        if (!event?.eventDate) return false;

        const eventDate = new Date(event.eventDate);
        const today = new Date();

        // Normalize times
        eventDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Registration only allowed if today is before event date
        if (today >= eventDate) return false;

        // Calculate difference in days
        const diffTime = eventDate - today;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Disallow registration on 3, 2, 1 days before and event day
        if ([0, 1, 2].includes(diffDays)) return false;

        // Allowed on all other days
        return true;
    };





    const formatTimeTo12Hour = (timeString) => {
        if (!timeString) return "";
        const [hour, minute] = timeString.split(":").map(Number);
        const period = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
    };

    const fetchEventDetailById = async (showLoading = true) => {
        try {
            setDisabled(true)
            if (showLoading) setLoading(true);
            const response = await fetchEventDetail(item?.id);
            if (response?.success && response?.data?.event) {
                setEventDetail(response.data);
            }
        } catch (err) {
            console.log("Error fetching event detail:", err.message);
        } finally {
            if (showLoading) setLoading(false);
            setDisabled(false)
        }
    };

    const unRegister = async () => {
        if (!eventDetail?.event?.eventid) return;

        try {
            setCancelling(true);
            await unRegisterEvent(eventDetail.event.eventid);
            await fetchEventDetailById(false);
        } catch (err) {
            console.log("Error unregistering event:", err.message);
        } finally {
            setCancelling(false);
        }
    };

    const handleButtonPress = () => {
        if (eventDetail?.isRegistered) unRegister();
        else navigation.navigate(Screen.EventRegistrationAsScreen, {
            eventId: item?.id, onFinish: async () => {
                setProcessing(true);    // show overlay immediately
                await fetchEventDetailById(false);
                setProcessing(false);   //
            }
        });
    };

    const handleGuestPress = () => {
        navigation.navigate(Screen.GuestDetail, { isMemberInclude: eventDetail?.registration?.isMemberInclude, registrationId: eventDetail?.registration?.registrationId, guestData: eventDetail?.guests || [], isEditAllow: isEventAllowedToRegister(), onFinish: () => fetchEventDetailById(false) });
    };

    const SkeletonBlock = ({ width, height, style }) => {
        const translateX = shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-width, width],
        });

        return (
            <View style={[{ backgroundColor: colors.itemSeparateColor, overflow: "hidden", borderRadius: 4, width, height, marginVertical: 4 }, style]}>
                <Animated.View style={{ width: "50%", height: "100%", backgroundColor: "#e0e0e0", transform: [{ translateX }], opacity: 0.5 }} />
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ padding: 16 }}>
                    <HeaderWithActions title="Event Detail" onBackPress={() => navigation.goBack()} />
                </View>
                <ScrollView contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}>
                    <SkeletonBlock width={300} height={221} style={{ borderRadius: 16, alignSelf: 'center', marginBottom: 16 }} />
                    <View style={{ marginHorizontal: 16 }}>
                        <SkeletonBlock width={150} height={20} style={{ marginBottom: 12 }} />
                        <SkeletonBlock width={150} height={20} style={{ marginBottom: 8 }} />
                        <SkeletonBlock width={250} height={20} style={{ marginBottom: 8 }} />
                        <SkeletonBlock width={180} height={20} style={{ marginBottom: 8 }} />
                        <SkeletonBlock width={120} height={16} style={{ marginBottom: 16 }} />
                    </View>
                    <SkeletonBlock width={300} height={120} style={{ marginBottom: 16, alignSelf: 'center' }} />
                    <SkeletonBlock width={300} height={80} style={{ borderRadius: 16, alignSelf: 'center' }} />
                </ScrollView>
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
                <TouchableOpacity style={styles.imageContainer}
                    onPress={() => {
                        if (event?.eventImage) {
                            setImageViewerImages([{ uri: getFullImageUrl(event.eventImage) }]);
                            setIsImageViewerVisible(true);
                        }
                    }}
                >
                    <ImageBackground source={{ uri: getFullImageUrl(event.eventImage) }} style={styles.image} resizeMode="cover">
                        <View style={styles.overlay} />
                        <View style={styles.ruleContainer}>
                            <Text style={styles.ruleText}>
                                {(event.eventRule || "No rules provided").trim().replace(/\s+/g, ' ')}
                            </Text>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>

                <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                    <Text style={styles.title}>{event.eventTitle}</Text>
                    {event.eventType === "online" ? (
                        <Text style={styles.location}>
                            Join with this link{" "}
                            <Text
                                style={{ color: "blue", textDecorationLine: "underline" }}
                                onPress={() => Linking.openURL(event.eventLocation)}
                            >
                                {event.eventLocation}
                            </Text>
                        </Text>
                    ) : (
                        <Text style={styles.location}>{event.eventLocation}</Text>
                    )}


                    <View style={styles.row}>
                        <Image source={EndoCalendar} style={styles.icon} />
                        <Text style={styles.infoText}>{new Date(event.eventDate).toDateString()}</Text>
                    </View>

                    <View style={styles.row}>
                        <Image source={EndoClock} style={styles.icon} />
                        <Text style={styles.infoText}>
                            {`${formatTimeTo12Hour(event.startTime)} - ${formatTimeTo12Hour(event.endTime)}`}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Image source={EndoVieo} style={styles.icon} />
                        <Text style={styles.infoText}>{event.eventType === "inPerson" ? "In-Person" : "Online"}</Text>
                    </View>

                    <Text style={styles.priceText}>
                        💰 {event.eventFee ? `${formattedPrice(event.eventFee)} Ks ` : "Free"}
                    </Text>
                </View>

                {isRegistered && guests?.length > 0 && (
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.guestHeaderRow} onPress={handleGuestPress}>
                            <Text style={styles.sectionTitle}>Other Guests: {guests.length}</Text>
                            <Image source={require("../assets/icons/endo-arrow-right-01.png")} style={styles.arrowIcon} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.description}>{event.eventDescription || "No description available."}</Text>
                    </View>
                </View>
            </ScrollView>

            {isEventAllowedToRegister() && (
                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity
                        style={[styles.bottomButton, { backgroundColor: isRegistered ? colors.cancelButton || "#E53935" : colors.button }]}
                        onPress={handleButtonPress}
                        disabled={disabled || cancelling}
                    >
                        <Text style={[styles.bottomButtonText, { color: isRegistered ? "#fff" : colors.text }]}>
                            {isRegistered ? "Cancel Registration" : "Register Now"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Full-screen Overlay Loading */}
            {cancelling && (
                <View style={styles.overlayLoading}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
            <ImageViewing
                images={imageViewerImages} // Use the state array
                imageIndex={0}
                visible={isImageViewerVisible}
                onRequestClose={() => setIsImageViewerVisible(false)}
            />
            {processing && (
                <View style={styles.overlayLoading}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}


        </SafeAreaView>
    );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    imageContainer: { width: "100%", height: 221, overflow: "hidden" },
    image: { flex: 1, justifyContent: "flex-start" },
    overlay: { ...StyleSheet.absoluteFill },
    ruleContainer: { backgroundColor: colors.ruleBackgroundColor },
    ruleText: { textAlign: "center", fontFamily: FontFamily.Medium, fontWeight: "500", color: "#fff", fontSize: 14, paddingVertical: 8 },
    card: { marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 16, backgroundColor: colors.itemSeparateColor },
    title: { fontFamily: FontFamily.SemiBold, fontSize: 24, fontWeight: "600", color: colors.text, paddingVertical: 8 },
    location: { fontFamily: FontFamily.Medium, fontSize: 16, color: colors.text, fontWeight: "500", marginBottom: 8 },
    row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    icon: { width: 22, height: 22, resizeMode: "contain", marginRight: 8, tintColor: colors.text },
    infoText: { fontFamily: FontFamily.Medium, fontSize: 15, color: colors.text },
    priceText: { marginTop: 6, fontFamily: FontFamily.Medium, fontSize: 15, color: colors.text },
    sectionTitle: { fontFamily: FontFamily.Medium, fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 6 },
    descriptionContainer: { borderTopColor: colors.itemSeparateColor, paddingTop: 10 },
    description: { fontFamily: FontFamily.Medium, fontSize: 16, fontWeight: "500", color: colors.text },
    guestHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    arrowIcon: { width: 18, height: 18, resizeMode: "contain" },
    bottomButtonContainer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", padding: 16, borderTopWidth: 1, borderTopColor: colors.itemSeparateColor },
    bottomButton: { borderRadius: 9999, paddingVertical: 14, alignItems: "center" },
    bottomButtonText: { fontFamily: FontFamily.SemiBold, fontSize: 16 },

    overlayLoading: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },

    imageContainerSkeleton: { width: "100%", height: 221, borderRadius: 16, backgroundColor: colors.itemSeparateColor },
});
