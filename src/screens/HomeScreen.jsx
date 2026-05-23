import React, { useRef, useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    BackHandler,
    Platform,
    Image,
    FlatList,
    PanResponder,
    Alert,
    Modal
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import FlipCard from "../components/FlipCard";
import { exitApp } from "@logicwind/react-native-exit-app";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import EventCard from "../components/EventCard";
import { fetchAllEvents } from "../controllers/EventController";
import HttpSerivce, { getFullImageUrl } from "../common/HttpSerivce";
import { fetchMemberInfo } from "../controllers/MemberController";
import KnowledgeCardSkeleton from "../components/KnowledgeCardSkeleton";
import Screen from "../utils/Screen";
import CustomDatePicker from "../components/CustomDatePicker";
import { useUserType } from "../utils/useUserType";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const HomeScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { isMember, isNonMember, loading: userTypeLoading } = useUserType();
    const containerOffset = Platform.OS === "android" ? 260 : 300;
    const translateY = useRef(new Animated.Value(containerOffset)).current;

    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedChip, setSelectedChip] = useState(0);
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [memberInfo, setMemberInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isDialogVisible, setIsDialogVisible] = useState(false);



    const lastTranslateY = useRef(containerOffset);
    const chips = ["All", "In-person", "Online", "Registered", "Free", "Paid"];

    // ------------------- PanResponder -------------------
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                let newY = lastTranslateY.current + gestureState.dy;
                if (newY < 0) newY = 0;
                if (newY > containerOffset) newY = containerOffset;
                translateY.setValue(newY);
            },
            onPanResponderRelease: (_, gestureState) => {
                let newY = lastTranslateY.current + gestureState.dy;
                if (gestureState.dy < -50) {
                    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
                    lastTranslateY.current = 0;
                    setIsExpanded(true);
                } else if (gestureState.dy > 50) {
                    Animated.spring(translateY, { toValue: containerOffset, useNativeDriver: true }).start();
                    lastTranslateY.current = containerOffset;
                    setIsExpanded(false);
                } else {
                    Animated.spring(translateY, { toValue: lastTranslateY.current, useNativeDriver: true }).start();
                }
            },
        })
    ).current;

    // ------------------- Data Loading -------------------
    const loadMemberInfo = useCallback(async () => {
        try {
            const response = await fetchMemberInfo();
            if (response.success) setMemberInfo(response.data);
        } catch (error) {
            console.error("Error fetching member info:", error);
        }
    }, []);

    // 🕒 helper to convert 24-hour time to 12-hour AM/PM
    const formatTimeTo12Hour = useCallback((timeString) => {
        if (!timeString) return "";
        const [hour, minute] = timeString.split(":").map(Number);
        const period = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
    }, []);


    const loadEvents = useCallback(async () => {
        try {
            const response = await fetchAllEvents();
            console.log("events response:", JSON.stringify(response.data[0]));
            if (response.success) {
                const visibleEvents = response.data.filter((item) => {
                    const accessType = (item.accessType || "").toUpperCase();
                    return isMember || accessType !== "MEMBER";
                });

                const formattedEvents = visibleEvents.map((item) => {
                    const eventDate = new Date(item.eventDate);
                    const formattedStart = formatTimeTo12Hour(item.startTime);
                    const formattedEnd = formatTimeTo12Hour(item.endTime);
                    const memberPrice = item.eventFee ?? 0;
                    const nonMemberPrice = item.nonMemberFee;
                    const visiblePrice =
                        isNonMember && nonMemberPrice !== null && nonMemberPrice !== undefined
                            ? nonMemberPrice
                            : memberPrice;

                    return {
                        id: item.eventid?.toString() ?? "",
                        name: item.eventTitle ?? "Untitled",
                        createdBy: item.createdBy ?? "Admin",
                        createdAt: item.createdDate ?? new Date().toISOString(),
                        description: item.eventTitle ?? "",
                        body: item.eventDescription ?? "",
                        image: item.eventImage ? { uri: getFullImageUrl(item.eventImage) } : null,
                        location: item.eventLocation ?? "",
                        dateObj: eventDate,
                        date: `${eventDate.getDate().toString().padStart(2, "0")}/${(eventDate.getMonth() + 1)
                            .toString()
                            .padStart(2, "0")}/${eventDate.getFullYear()}`,  // 👈 formatted dd/mm/yyyy
                        displayDate: eventDate.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        }),
                        time: `${formattedStart} - ${formattedEnd}`,
                        price: visiblePrice,
                        memberPrice,
                        nonMemberPrice,
                        showNonMemberPrice: isNonMember,
                        accessType: item.accessType,
                        eventType: item.eventType ?? "inPerson",
                        rule: item.eventRule ?? "",
                        isRegistered: item.isRegistered ?? 0,
                        isPaid: item.isPaid ?? false,
                    };
                });
                setEvents(formattedEvents);
                setFilteredEvents(formattedEvents);
            }
        } catch (err) {
            console.log("Error fetching events:", err);
        }
    }, [formatTimeTo12Hour, isMember, isNonMember]);

    useEffect(() => {
        const checkDefaultPassword = async () => {
            if (!isMember) return;

            try {
                const isDefaultPassword = await HttpSerivce.getIsDefaultPassword();
                if (isDefaultPassword) {
                    setIsDialogVisible(true); // ✅ Prevent future dialogs
                    // Alert.alert(
                    //     "Security Alert",
                    //     "You are using a default password. Please change it for your account’s security.",
                    //     [
                    //         {
                    //             text: "Change Now",
                    //             onPress: () => navigation.navigate(Screen.ChangePassword),
                    //         },
                    //         { text: "Later", style: "cancel" },
                    //     ]
                    // );
                }
            } catch (err) {
                console.error("Error checking default password:", err);
            }
        };

        checkDefaultPassword();
    }, [isMember]); // 👈 runs only once for members

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchData = async () => {
                if (userTypeLoading) return;

                setLoading(true);
                try {
                    await Promise.all([
                        loadEvents(),
                        isMember ? loadMemberInfo() : Promise.resolve(setMemberInfo(null)),
                    ]);
                } catch (err) {
                    console.error(err);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchData();

            return () => {
                isActive = false; // cleanup to prevent state update on unmounted screen
            };
        }, [isMember, loadEvents, loadMemberInfo, userTypeLoading])
    );

    // ------------------- Back Handler -------------------
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                exitApp();
                return true;
            };
            const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
            return () => subscription.remove();
        }, [])
    );

    // ------------------- Filtering -------------------
    const applyFilters = useCallback((date = selectedDate, chip = selectedChip) => {
        let filtered = events;

        if (date) {
            const selectedStr = date.toDateString();
            filtered = filtered.filter(item => item.dateObj.toDateString() === selectedStr);
        }

        switch (chip) {
            case 1:
                filtered = filtered.filter(item => item.eventType === "inPerson");
                break;
            case 2:
                filtered = filtered.filter(item => item.eventType === "online");
                break;
            case 3:
                filtered = filtered.filter(item => item.isRegistered === 1);
                break;
            case 4:
                filtered = filtered.filter(item => item.price === 0);
                break;
            case 5:
                filtered = filtered.filter(item => item.isPaid === true);
                break;

            default:
                break;
        }

        setFilteredEvents(filtered);
    }, [events, selectedChip, selectedDate]);

    const clearDateFilter = () => {
        setSelectedDate(null);
        applyFilters(null, selectedChip);
    };

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadEvents();
        setRefreshing(false);
    };

    const formatDateText = (date) => {
        if (!date) return "Filter";
        const options = { year: "numeric", month: "short", day: "numeric" };
        return date.toLocaleDateString(undefined, options);
    };

    const handleChangePassword = () => {
        setIsDialogVisible(false);
        navigation.navigate(Screen.ChangePassword);
    };

    const handleLater = () => {
        setIsDialogVisible(false);
    };

    const toggleExpand = () => {
        const toValue = isExpanded ? containerOffset : 0;
        Animated.spring(translateY, { toValue, useNativeDriver: true }).start();
        setIsExpanded(!isExpanded);
    };

    const onClickEvent = useCallback((item) => {
        navigation.navigate(Screen.EventDetailScreen, { item });
    }, [navigation]);

    const renderEventItem = ({ item }) => (
        <EventCard item={item} onPress={() => onClickEvent(item)} />
    );

    const renderChipItem = ({ item, index }) => {
        const isSelected = selectedChip === index;
        return (
            <TouchableOpacity
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => {
                    setSelectedChip(index);
                    applyFilters(selectedDate, index);
                }}
            >
                <Text style={styles.chipText}>{item}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Date Picker */}
            <CustomDatePicker
                visible={showDatePicker}
                initialDate={selectedDate || new Date()}
                onCancel={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                    setSelectedDate(date);
                    applyFilters(date, selectedChip);
                    setShowDatePicker(false);
                }}
            />

            {/* Flip Card */}
            {isMember && (
                <View style={{ paddingTop: 16, marginHorizontal: 16 }}>
                    <FlipCard
                        frontImage={require("../assets/images/Front.png")}
                        backImage={require("../assets/images/Back.png")}
                        info={memberInfo}
                        loading={loading}
                    />
                </View>
            )}

            {isNonMember && (
                <View style={styles.nonMemberLogoContainer}>
                    <Image
                        source={require("../assets/images/appLogo.png")}
                        style={styles.nonMemberLogo}
                        resizeMode="contain"
                    />
                </View>
            )}

            {/* Animated Card */}
            <Animated.View style={[styles.cardContainer, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
                <View style={[styles.header, { paddingTop: (Platform.OS === 'ios' && isExpanded) && insets.top }]}>
                    <View>
                        <Text style={styles.headerText}>Welcome to MMBC</Text>
                        {isNonMember && (
                            <Text style={styles.userTypeText}>Non-member</Text>
                        )}
                    </View>
                    <View style={styles.filterContainer}>
                        <TouchableOpacity style={styles.filterButton} onPress={() => setShowDatePicker(true)}>
                            {!selectedDate && (
                                <Image source={require("../assets/icons/endo-sort.png")} style={styles.filterIcon} />
                            )}
                            <Text style={styles.filterText}>{formatDateText(selectedDate)}</Text>
                            {selectedDate && (
                                <TouchableOpacity onPress={clearDateFilter} style={{ marginLeft: 8 }} hitSlop={20}>
                                    <Image source={require("../assets/icons/close.png")} style={styles.cancelIcon} />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Chips */}
                <View style={{ paddingVertical: 8 }}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={chips}
                        keyExtractor={(_, index) => index.toString()}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                        renderItem={renderChipItem}
                    />
                </View>

                {/* Event List */}
                {loading ? (
                    <View style={{ paddingHorizontal: 16 }}>
                        {[...Array(5)].map((_, index) => (
                            <KnowledgeCardSkeleton key={index} />
                        ))}
                    </View>
                ) : (
                    <FlatList
                        data={filteredEvents}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderEventItem}
                        contentContainerStyle={{ paddingBottom: isExpanded ? 110 : Platform.OS === 'android' ? 360 : 400, paddingHorizontal: 16 }}
                        ItemSeparatorComponent={() => <View style={{ height: 25 }} />}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        ListEmptyComponent={
                            <View style={{ alignItems: "center", marginTop: 50 }}>
                                <Text style={{ color: colors.text, fontFamily: FontFamily.Medium }}>
                                    No events found {selectedDate && 'for selected date'}
                                </Text>
                            </View>
                        }
                    />
                )}
            </Animated.View>
            <Modal
                visible={isDialogVisible}
                transparent
                animationType="fade"
                onRequestClose={handleLater}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.title}>Security Alert</Text>
                        <Text style={styles.message}>
                            You are using a default password. Please change it for your account’s security.
                        </Text>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                                <Text style={styles.buttonText}>Change Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleLater}>
                                <Text style={[styles.buttonText, styles.cancelText]}>Later</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    nonMemberLogoContainer: {
        paddingTop: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    nonMemberLogo: {
        width: 174,
        height: 174,
    },
    cardContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        backgroundColor: "white",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        zIndex: 10,
        elevation: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    cancelIcon: {
        width: 20,
        height: 20,
        tintColor: colors.text,
    },
    headerText: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 20,
        fontWeight: "600",
        lineHeight: 28,
        color: colors.text,
    },
    userTypeText: {
        fontFamily: FontFamily.Medium,
        fontSize: 13,
        fontWeight: "500",
        color: colors.loginAccountColor,
        marginTop: 2,
    },
    filterContainer: { flexDirection: "row", alignItems: "center" },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderRadius: 9999,
        borderColor: colors.textInputBorderColor,
    },
    filterIcon: { width: 16, height: 16, tintColor: colors.text, marginRight: 8 },
    filterText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        lineHeight: 24,
        color: colors.text,
    },
    chip: {
        height: 48,
        borderRadius: 9999,
        backgroundColor: colors.itemSeparateColor,
        paddingHorizontal: 16,
        paddingVertical: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    chipSelected: { backgroundColor: colors.button },
    chipText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        lineHeight: 24,
        color: colors.text,
        textAlign: "center",
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        elevation: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 30,
        backgroundColor: "#FACC15",
        marginHorizontal: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    cancelButton: {
        backgroundColor: "#ccc",
    },
    cancelText: {
        color: "#333",
    },
});
