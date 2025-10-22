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
    PanResponder
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import FlipCard from "../components/FlipCard";
import { exitApp } from "@logicwind/react-native-exit-app";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import DatePicker from "react-native-date-picker";
import EventCard from "../components/EventCard";
import { fetchAllEvents } from "../controllers/EventController";
import { getFullImageUrl } from "../common/HttpSerivce";
import { fetchMemberInfo } from "../controllers/MemberController";
import KnowledgeCardSkeleton from "../components/KnowledgeCardSkeleton";
import Screen from "../utils/Screen";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const HomeScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const containerOffset = Platform.OS === "android" ? 260 : 300;
    const translateY = useRef(new Animated.Value(containerOffset)).current;
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedChip, setSelectedChip] = useState(0);
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]); // ✅ For date filter
    const [memberInfo, setMemberInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const lastTranslateY = useRef(containerOffset);



    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                let newY = lastTranslateY.current + gestureState.dy;
                if (newY < 0) newY = 0; // top limit
                if (newY > containerOffset) newY = containerOffset; // bottom limit
                translateY.setValue(newY);
            },
            onPanResponderRelease: (_, gestureState) => {
                let newY = lastTranslateY.current + gestureState.dy;
                // Snap based on gesture
                if (gestureState.dy < -50) {
                    // drag up
                    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
                    lastTranslateY.current = 0;
                    setIsExpanded(true)

                } else if (gestureState.dy > 50) {
                    // drag down
                    Animated.spring(translateY, { toValue: containerOffset, useNativeDriver: true }).start();
                    lastTranslateY.current = containerOffset;
                    setIsExpanded(false)
                } else {
                    // snap back to current
                    Animated.spring(translateY, { toValue: lastTranslateY.current, useNativeDriver: true }).start();
                }
            },
        })
    ).current;

    const onRefresh = async () => {
        setRefreshing(true);
        await loadEvents();      // reload events
        setRefreshing(false);
    };

    const chips = ["All", "In-person", "Online", "Registered"];

    const loadMemberInfo = async () => {
        try {
            const response = await fetchMemberInfo();
            if (response.success) {
                setMemberInfo(response.data);
            } else {
                console.error("Failed to fetch member:", response.message);
            }
        } catch (error) {
            console.error("Error fetching member info:", error);
        }
    };

    const loadEvents = async () => {
        try {
            const response = await fetchAllEvents();
            console.log("respone", response)
            if (response.success) {
                const formattedEvents = response.data.map((item) => ({
                    id: item.eventid.toString(),
                    name: item.eventTitle,
                    createdBy: item.createdBy || "Admin",
                    createdAt: item.createdDate,
                    description: item.eventTitle,
                    body: item.eventDescription,
                    image: item.eventImage ? { uri: getFullImageUrl(item.eventImage) } : null,
                    location: item.eventLocation,
                    dateObj: new Date(item.eventDate), // ✅ store real Date
                    date: new Date(item.eventDate).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    }),
                    price: item.eventFee,
                    type: item.eventType,
                    rule: item.eventRule,
                    eventType: item.eventType,
                    isRegistered: item.isRegistered
                }));
                setEvents(formattedEvents);
                setFilteredEvents(formattedEvents);
            }
        } catch (err) {
            console.log("Error fetching events:", err);
        }
    };

    useEffect(() => {
        let filtered = events;
        console.log("fileter", filtered)

        // Filter by date
        if (selectedDate) {
            const selectedStr = selectedDate.toDateString();
            filtered = filtered.filter(
                (item) => item.dateObj.toDateString() === selectedStr
            );
        }

        // Filter by chip
        switch (selectedChip) {
            case 1: // In-person
                filtered = filtered.filter(item => item.eventType === "inPerson");
                console.log("itm")
                break;
            case 2: // Online
                filtered = filtered.filter(item => item.eventType === "online");
                break;
            case 3: // Registered
                filtered = filtered.filter(item => item.isRegistered === 1); // adjust if you have a different prop
                break;
            default:
                break; // All
        }

        setFilteredEvents(filtered);
    }, [selectedDate, selectedChip, events]);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([loadEvents(), loadMemberInfo()]);
            setLoading(false);
        };
        fetchData();
    }, []);

    // ✅ Apply date filter when date changes
    useEffect(() => {
        if (!selectedDate) {
            setFilteredEvents(events);
            return;
        }

        const selectedStr = selectedDate.toDateString();
        const filtered = events.filter(
            (item) => new Date(item.dateObj).toDateString() === selectedStr
        );
        setFilteredEvents(filtered);
    }, [selectedDate, events]);

    const openDatePicker = () => setShowDatePicker(true);

    const formatDateText = (date) => {
        if (!date) return "Filter";
        const options = { year: "numeric", month: "short", day: "numeric" };
        return date.toLocaleDateString(undefined, options);
    };

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

    const clearFilter = () => {
        setSelectedDate(null);
        setFilteredEvents(events);
    };

    const toggleExpand = () => {
        const toValue = isExpanded ? containerOffset : 0;
        Animated.spring(translateY, {
            toValue,
            useNativeDriver: true,
        }).start();
        setIsExpanded(!isExpanded);
    };
    const onClickEvent = useCallback((item) => {
        navigation.navigate(Screen.EventDetailScreen, { item })
    })

    const renderEventItem = ({ item }) => (
        <EventCard item={item} onPress={() => onClickEvent(item)} />
    );

    const renderChipItem = ({ item, index }) => {
        const isSelected = selectedChip === index;
        return (
            <TouchableOpacity
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedChip(index)}
            >
                <Text style={styles.chipText}>{item}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* ✅ Date Picker Modal */}
            <DatePicker
                modal
                mode="date"
                open={showDatePicker}
                date={selectedDate || new Date()}
                onConfirm={(date) => {
                    setShowDatePicker(false);
                    setSelectedDate(date);
                }}
                onCancel={() => setShowDatePicker(false)}
            />

            <View style={{ paddingVertical: 16 }}>
                <FlipCard
                    frontImage={require("../assets/images/Front.png")}
                    backImage={require("../assets/images/Back.png")}
                    info={memberInfo}
                    loading={loading}
                />
            </View>

            <Animated.View style={[styles.cardContainer, { transform: [{ translateY }] }]}
                {...panResponder.panHandlers}>
                {/* <TouchableOpacity activeOpacity={1} onPress={toggleExpand}> */}
                <View style={[styles.header, { paddingTop: isExpanded && insets.top }]}>
                    <Text style={styles.headerText}>Welcome to MMBC</Text>
                    <View style={styles.filterContainer}>
                        <TouchableOpacity style={styles.filterButton} onPress={openDatePicker}>
                            <Image source={require("../assets/icons/endo-sort.png")} style={styles.filterIcon} />
                            <Text style={styles.filterText}>{formatDateText(selectedDate)}</Text>
                            {selectedDate && (
                                <TouchableOpacity onPress={clearFilter} style={{ marginLeft: 8 }}>
                                    <Image source={require("../assets/icons/close.png")} style={styles.cancelIcon} />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
                {/* </TouchableOpacity> */}

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

                {/* ✅ Skeleton Loader or Filtered Events */}
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
                        contentContainerStyle={{ paddingBottom: 110, paddingHorizontal: 16 }}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                        scrollEnabled={true}
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
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
    filterIcon: { width: 24, height: 24, tintColor: colors.text, marginRight: 8 },
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
});
