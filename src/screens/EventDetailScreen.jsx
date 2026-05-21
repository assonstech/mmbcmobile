import React, { useCallback, useEffect, useState, useRef } from "react";
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
    Alert,
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
import RNCalendarEvents from "react-native-calendar-events";
import { useUserType } from "../utils/useUserType";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const EventDetailScreen = ({ navigation, route }) => {
    const { item } = route?.params || {};
    const { isNonMember } = useUserType();

    const [eventDetail, setEventDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [imageViewerImages, setImageViewerImages] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [showExpiredModal, setShowExpiredModal] = useState(false);
    const [showCalendarSuccessModal, setShowCalendarSuccessModal] = useState(false);
    const [showCalendarExistsModal, setShowCalendarExistsModal] = useState(false);

    const shimmerAnim = useRef(new Animated.Value(0)).current;

    const startShimmer = useCallback(() => {
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
    }, [shimmerAnim]);

    const getEventDayDiff = () => {
        const currentEvent = eventDetail?.event;
        if (!currentEvent?.eventDate) return null;

        const eventDate = new Date(currentEvent.eventDate);
        const today = new Date();

        eventDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = eventDate.getTime() - today.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const isEventExpired = useCallback((eventParam) => {
        if (!eventParam?.eventDate) return false;

        const eventDate = new Date(eventParam.eventDate);
        const today = new Date();

        eventDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return today >= eventDate;
    }, []);

    const isEventAllowedToRegister = () => {
        const diffDays = getEventDayDiff();
        if (diffDays === null) return false;
        return diffDays > 3;
    };

    const formatTimeTo12Hour = (timeString) => {
        if (!timeString) return "";
        const [hour, minute] = timeString.split(":").map(Number);
        const period = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
    };

    const combineDateAndTimeLocal = (dateString, timeString) => {
        if (!dateString || !timeString) return null;

        const onlyDate = dateString.slice(0, 10);
        const [year, month, day] = onlyDate.split("-").map(Number);
        const [hours, minutes, seconds] = timeString.split(":").map(Number);

        return new Date(
            year,
            month - 1,
            day,
            hours || 0,
            minutes || 0,
            seconds || 0,
            0
        );
    };

    const isSameDateTime = (a, b) => {
        if (!a || !b) return false;
        return new Date(a).getTime() === new Date(b).getTime();
    };

    const fetchEventDetailById = useCallback(async (showLoading = true) => {
        try {
            setDisabled(true);
            if (showLoading) setLoading(true);

            const response = await fetchEventDetail(item?.id);
            console.log("event detail response:", JSON.stringify(response));

            if (response?.success && response?.data?.event) {
                console.log("event detail response:", JSON.stringify(response.data));
                setEventDetail(response.data);

                if (isEventExpired(response.data.event)) {
                    setShowExpiredModal(true);
                } else {
                    setShowExpiredModal(false);
                }
            }
        } catch (err) {
            console.log("Error fetching event detail:", err.message);
        } finally {
            if (showLoading) setLoading(false);
            setDisabled(false);
        }
    }, [isEventExpired, item?.id]);

    useEffect(() => {
        startShimmer();
        if (item?.id) fetchEventDetailById(true);
    }, [fetchEventDetailById, item?.id, startShimmer]);

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

    const findExistingCalendarEvent = async (currentEvent) => {
        const startDate = combineDateAndTimeLocal(
            currentEvent.eventDate,
            currentEvent.startTime
        );
        const endDate = combineDateAndTimeLocal(
            currentEvent.eventDate,
            currentEvent.endTime
        );

        if (!startDate || !endDate) return null;

        const rangeStart = new Date(startDate);
        rangeStart.setHours(0, 0, 0, 0);

        const rangeEnd = new Date(endDate);
        rangeEnd.setHours(23, 59, 59, 999);

        const events = await RNCalendarEvents.fetchAllEvents(
            rangeStart.toISOString(),
            rangeEnd.toISOString(),
            []
        );

        const currentTitle = (currentEvent.eventTitle || "").trim();
        const currentLocation = (currentEvent.eventLocation || "").trim();
        const currentStartIso = startDate.toISOString();
        const currentEndIso = endDate.toISOString();

        return (
            events.find((calendarEvent) => {
                const sameTitle =
                    (calendarEvent.title || "").trim() === currentTitle;

                const sameStart = isSameDateTime(
                    calendarEvent.startDate,
                    currentStartIso
                );

                const sameEnd = isSameDateTime(
                    calendarEvent.endDate,
                    currentEndIso
                );

                const sameLocation =
                    (calendarEvent.location || "").trim() === currentLocation;

                return sameTitle && sameStart && sameEnd && sameLocation;
            }) || null
        );
    };

    const handleAddToCalendar = async () => {
        try {
            const currentEvent = eventDetail?.event;

            if (!currentEvent?.eventDate || !currentEvent?.startTime || !currentEvent?.endTime) {
                Alert.alert("Error", "Event date or time is missing.");
                return;
            }

            setProcessing(true);

            const permission = await RNCalendarEvents.requestPermissions();

            if (permission !== "authorized") {
                setProcessing(false);
                Alert.alert("Permission denied", "Calendar permission is required.");
                return;
            }

            const startDate = combineDateAndTimeLocal(
                currentEvent.eventDate,
                currentEvent.startTime
            );
            const endDate = combineDateAndTimeLocal(
                currentEvent.eventDate,
                currentEvent.endTime
            );

            if (!startDate || !endDate) {
                setProcessing(false);
                Alert.alert("Error", "Invalid event date or time.");
                return;
            }

            if (endDate <= startDate) {
                setProcessing(false);
                Alert.alert("Error", "End time must be later than start time.");
                return;
            }

            const existingEvent = await findExistingCalendarEvent(currentEvent);

            if (existingEvent) {
                setProcessing(false);
                setShowCalendarExistsModal(true);
                return;
            }

            const eventId = await RNCalendarEvents.saveEvent(
                currentEvent.eventTitle || "Event",
                {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    location: currentEvent.eventLocation || "",
                    notes: currentEvent.eventDescription || "",
                    timeZone: "Asia/Yangon",
                },
                {
                    sync: true,
                }
            );

            setProcessing(false);

            if (eventId) {
                setShowCalendarSuccessModal(true);
            } else {
                Alert.alert("Info", "Calendar event was not created.");
            }
        } catch (error) {
            setProcessing(false);
            console.log("Add to calendar error:", error);
            Alert.alert("Error", "Failed to add event to calendar.");
        }
    };

    const handleButtonPress = () => {
        if (eventDetail?.isRegistered) {
            unRegister();
        } else {
            navigation.navigate(Screen.EventRegistrationAsScreen, {
                eventId: item?.id,
                onFinish: async () => {
                    setProcessing(true);
                    await fetchEventDetailById(false);
                    setProcessing(false);
                },
            });
        }
    };

    const handleReceiptInformation = () => {
        navigation.navigate(Screen.ReceiptInformation, {
            registrationId: eventDetail?.registration?.registrationId,
            eventId: eventDetail?.event?.eventid,
            isPaid: eventDetail?.registration?.isPaid,

            eventTitle: eventDetail?.event?.eventTitle,
            eventLocation: eventDetail?.event?.eventLocation,
            eventFee: eventDetail?.event?.eventFee,
            eventDate: eventDetail?.event?.eventDate,

            companyName:
                eventDetail?.registration?.companyOrIndividualName ||
                "Malaysia Myanmar Business Chamber",

            paymentType: "Cash",
        });
    };

    const handleGuestPress = () => {
        navigation.navigate(Screen.GuestDetail, {
            isMemberInclude: eventDetail?.registration?.isMemberInclude,
            registrationId: eventDetail?.registration?.registrationId,
            guestData: eventDetail?.guests || [],
            isEditAllow: isEventAllowedToRegister(),
            onFinish: () => fetchEventDetailById(false),
        });
    };

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
                <View style={{ padding: 16 }}>
                    <HeaderWithActions title="Event Detail" onBackPress={() => navigation.goBack()} />
                </View>
                <ScrollView contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}>
                    <SkeletonBlock width={300} height={221} style={{ borderRadius: 16, alignSelf: "center", marginBottom: 16 }} />
                    <View style={{ marginHorizontal: 16 }}>
                        <SkeletonBlock width={150} height={20} style={{ marginBottom: 12 }} />
                        <SkeletonBlock width={150} height={20} style={{ marginBottom: 8 }} />
                        <SkeletonBlock width={250} height={20} style={{ marginBottom: 8 }} />
                        <SkeletonBlock width={180} height={20} style={{ marginBottom: 8 }} />
                        <SkeletonBlock width={120} height={16} style={{ marginBottom: 16 }} />
                    </View>
                    <SkeletonBlock width={300} height={120} style={{ marginBottom: 16, alignSelf: "center" }} />
                    <SkeletonBlock width={300} height={80} style={{ borderRadius: 16, alignSelf: "center" }} />
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
    const showNonMemberPrice =
        isNonMember && event?.nonMemberFee !== null && event?.nonMemberFee !== undefined;
    const visiblePrice =
        showNonMemberPrice
            ? event.nonMemberFee
            : event?.eventFee;

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <HeaderWithActions title="Event Detail" onBackPress={() => navigation.goBack()} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
                <TouchableOpacity
                    style={styles.imageContainer}
                    onPress={() => {
                        if (event?.eventImage) {
                            setImageViewerImages([{ uri: getFullImageUrl(event.eventImage) }]);
                            setIsImageViewerVisible(true);
                        }
                    }}
                >
                    <ImageBackground
                        source={{ uri: getFullImageUrl(event.eventImage) }}
                        style={styles.image}
                        resizeMode="cover"
                    >
                        <View style={styles.overlay} />
                        <View style={styles.ruleContainer}>
                            <Text style={styles.ruleText}>
                                {(event.eventRule || "No rules provided").trim().replace(/\s+/g, " ")}
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
                                style={styles.linkText}
                                onPress={() => Linking.openURL(event.eventLocation)}
                            >
                                {event.eventLocation}
                            </Text>
                        </Text>
                    ) : (
                        <Text style={styles.location}>{event.eventLocation}</Text>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.addtoCalendarButton,
                            processing && { opacity: 0.6 },
                        ]}
                        onPress={handleAddToCalendar}
                        disabled={processing}
                    >
                        <Image source={EndoCalendar} style={styles.icon} />
                        <Text style={[styles.bottomButtonText, { color: colors.text }]}>
                            Add to Calendar
                        </Text>
                    </TouchableOpacity>

                    {eventDetail?.isRegistered &&
                        eventDetail?.registration &&
                        !eventDetail?.registration?.isPaid && (
                            <TouchableOpacity
                                style={styles.receiptButton}
                                onPress={handleReceiptInformation}
                            >
                                <Image
                                    source={require("../assets/icons/ic_receipt.png")}
                                    style={styles.receiptIcon}
                                />

                                <Text style={styles.receiptButtonText}>
                                    Receipt information
                                </Text>
                            </TouchableOpacity>
                        )}

                    <View style={styles.row}>
                        <Image source={EndoCalendar} style={styles.icon} />
                        <Text style={styles.infoText}>
                            {new Date(event.eventDate).toDateString()}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Image source={EndoClock} style={styles.icon} />
                        <Text style={styles.infoText}>
                            {`${formatTimeTo12Hour(event.startTime)} - ${formatTimeTo12Hour(event.endTime)}`}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Image source={EndoVieo} style={styles.icon} />
                        <Text style={styles.infoText}>
                            {event.eventType === "inPerson" ? "In-Person" : "Online"}
                        </Text>
                    </View>

                    {showNonMemberPrice ? (
                        <View style={styles.priceGroup}>
                            <Text style={styles.priceText}>
                                💰 Member: {event.eventFee ? `${formattedPrice(event.eventFee)} Ks` : "Free"}
                            </Text>
                            <Text style={styles.priceText}>
                                💰 Non-member: {visiblePrice ? `${formattedPrice(visiblePrice)} Ks` : "Free"}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.priceText}>
                            💰 {visiblePrice ? `${formattedPrice(visiblePrice)} Ks ` : "Free"}
                        </Text>
                    )}
                </View>

                {isRegistered && guests?.length > 0 && (
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.guestHeaderRow} onPress={handleGuestPress}>
                            <Text style={styles.sectionTitle}>Other Guests: {guests.length}</Text>
                            <Image
                                source={require("../assets/icons/endo-arrow-right-01.png")}
                                style={styles.arrowIcon}
                            />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.description}>
                            {event.eventDescription || "No description available."}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {isEventAllowedToRegister() && (
                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.bottomButton,
                            {
                                backgroundColor: isRegistered
                                    ? colors.cancelButton || "#E53935"
                                    : colors.button,
                            },
                        ]}
                        onPress={handleButtonPress}
                        disabled={disabled || cancelling}
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
            )}

            <Modal visible={showExpiredModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.expiredModalCard}>
                        <View style={styles.expiredIconWrapper}>
                            <Image
                                source={require("../assets/icons/expired_info.png")}
                                style={styles.expiredIconImage}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={styles.expiredTitle}>Expired event</Text>

                        <Text style={styles.expiredDescription}>
                            You can’t register for this event because it is expired.
                        </Text>

                        <TouchableOpacity
                            style={styles.expiredButton}
                            onPress={() => {
                                setShowExpiredModal(false);
                                navigation.goBack();
                            }}
                        >
                            <Text style={styles.expiredButtonText}>Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showCalendarSuccessModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.successModalCard}>
                        <View style={styles.successBadgeOuter}>
                            <View style={styles.successBadgeInner}>
                                <Text style={styles.successIcon}>✓</Text>
                            </View>
                        </View>

                        <Text style={styles.successTitle}>Added to Calendar</Text>

                        <Text style={styles.successDescription}>
                            Your event has been successfully added to your calendar.
                        </Text>

                        <TouchableOpacity
                            style={styles.successButton}
                            onPress={() => setShowCalendarSuccessModal(false)}
                        >
                            <Text style={styles.successButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showCalendarExistsModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.infoModalCard}>
                        <View style={styles.infoBadgeOuter}>
                            <View style={styles.infoBadgeInner}>
                                <Text style={styles.infoIcon}>i</Text>
                            </View>
                        </View>

                        <Text style={styles.infoTitle}>Already in Calendar</Text>

                        <Text style={styles.infoDescription}>
                            This event has already been added to your calendar.
                        </Text>

                        <TouchableOpacity
                            style={styles.infoButton}
                            onPress={() => setShowCalendarExistsModal(false)}
                        >
                            <Text style={styles.infoButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {(cancelling || processing) && (
                <View style={styles.overlayLoading}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}

            <ImageViewing
                images={imageViewerImages}
                imageIndex={0}
                visible={isImageViewerVisible}
                onRequestClose={() => setIsImageViewerVisible(false)}
            />
        </SafeAreaView>
    );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    imageContainer: {
        width: "100%",
        height: 221,
        overflow: "hidden",
    },

    image: {
        flex: 1,
        justifyContent: "flex-start",
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
    },

    ruleContainer: {
        backgroundColor: colors.ruleBackgroundColor,
    },

    ruleText: {
        textAlign: "center",
        fontFamily: FontFamily.Medium,
        fontWeight: "500",
        color: "#fff",
        fontSize: 14,
        paddingVertical: 8,
    },

    card: {
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.itemSeparateColor,
    },

    title: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 24,
        fontWeight: "600",
        color: colors.text,
        paddingVertical: 8,
    },

    location: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: colors.text,
        fontWeight: "500",
        marginBottom: 8,
    },

    linkText: {
        color: "#2563EB",
        textDecorationLine: "underline",
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },

    icon: {
        width: 22,
        height: 22,
        resizeMode: "contain",
        marginRight: 8,
        tintColor: colors.text,
    },

    infoText: {
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        color: colors.text,
    },

    priceText: {
        marginTop: 6,
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        color: colors.text,
    },
    priceGroup: {
        marginTop: 2,
    },

    sectionTitle: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 6,
    },

    descriptionContainer: {
        borderTopColor: colors.itemSeparateColor,
        paddingTop: 10,
    },

    description: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: "500",
        color: colors.text,
    },

    guestHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    arrowIcon: {
        width: 18,
        height: 18,
        resizeMode: "contain",
    },

    bottomButtonContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.itemSeparateColor,
    },

    bottomButton: {
        borderRadius: 9999,
        paddingVertical: 14,
        alignItems: "center",
    },

    bottomButtonText: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 16,
    },

    addtoCalendarButton: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#FAFAFA",
        borderRadius: 999,
        paddingVertical: 14,
        paddingHorizontal: 18,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 16,
    },

    overlayLoading: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },

    expiredModalCard: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: "#FFF1F1",
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingVertical: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 18,
        elevation: 10,
    },

    expiredIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
        backgroundColor: "#FAD6D6",
    },

    expiredIconImage: {
        width: 28,
        height: 28,
    },

    expiredTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 24,
        fontWeight: "700",
        color: "#1A0000",
        marginBottom: 12,
    },

    expiredDescription: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: "#6F6582",
        marginBottom: 24,
        lineHeight: 24,
    },

    expiredButton: {
        width: "100%",
        borderWidth: 1.5,
        borderColor: colors.backtoHomeborderColor,
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: "center",
        backgroundColor: "#fff",
    },

    expiredButtonText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: "600",
        color: "#1A0000",
    },

    successModalCard: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingVertical: 28,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 18,
        elevation: 10,
    },

    successBadgeOuter: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: "#E6F9ED",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
    },

    successBadgeInner: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: "#34C759",
        justifyContent: "center",
        alignItems: "center",
    },

    successIcon: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "bold",
    },

    successTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 10,
        textAlign: "center",
    },

    successDescription: {
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },

    successButton: {
        width: "100%",
        backgroundColor: "#111827",
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: "center",
    },

    successButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    infoModalCard: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingVertical: 28,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 18,
        elevation: 10,
    },

    infoBadgeOuter: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: "#E8F1FF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
    },

    infoBadgeInner: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
    },

    infoIcon: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "bold",
    },

    infoTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 10,
        textAlign: "center",
    },

    infoDescription: {
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },

    infoButton: {
        width: "100%",
        backgroundColor: "#111827",
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: "center",
    },

    infoButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    receiptButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FDB515",
        borderRadius: 999,
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginBottom: 16,
    },

    receiptIcon: {
        width: 24,
        height: 24,
        resizeMode: "contain",
        marginRight: 10,
        tintColor: "#000",
    },

    receiptButtonText: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
});
