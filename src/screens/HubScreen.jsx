import React, { useEffect, useState, useCallback } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import KnowledgeCard from "../components/KnowledgeCard";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import { fetchKnowledgePosts } from "../controllers/KnowledgeController";
import { getFullImageUrl } from "../common/HttpSerivce";
import { timeAgo } from "../utils/timeHelper";
import KnowledgeCardSkeleton from "../components/KnowledgeCardSkeleton";
import CustomDatePicker from "../components/CustomDatePicker";
import { useFocusEffect } from "@react-navigation/native";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const HubScreen = () => {
    const [posts, setPosts] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const loadPosts = async () => {
        try {
            const data = await fetchKnowledgePosts();
            const formattedData = data?.map(item => ({
                id: item.id.toString(),
                name: item.createdBy || "Admin",
                timeAgo: timeAgo(item.createdAt),
                createdAt: item.createdAt,
                description: item.content,
                image: item.image ? { uri: getFullImageUrl(item.image) } : null,
            })) || [];
            setPosts(formattedData);
            setAllPosts(formattedData);
        } catch (err) {
            console.log("Error fetching posts:", err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchData = async () => {
                if (isActive) setLoading(true);
                await loadPosts();
                if (isActive) setLoading(false);
            };

            fetchData();

            return () => {
                isActive = false;
            };
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPosts();
        setRefreshing(false);
    }, []);

    // ✅ New unified filter function
    const applyFilters = (date) => {
        let filtered = allPosts;
        if (date) {
            const selectedStr = date.toDateString();
            filtered = filtered.filter(post => new Date(post.createdAt).toDateString() === selectedStr);
        }
        setPosts(filtered);
    };

    const clearFilter = () => {
        setSelectedDate(null);
        setPosts(allPosts);
    };

    const formatDateText = (date) => {
        if (!date) return "Filter";
        return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };

    return (
        <SafeAreaView style={{ flex: 1, paddingBottom: 80, backgroundColor: colors.bottomTabbarLabelColor }}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>HR Working Groups</Text>
                <View style={styles.filterContainer}>
                    <TouchableOpacity style={styles.filterButton} onPress={() => setShowDatePicker(true)}>
                        {!selectedDate && (
                            <Image source={require("../assets/icons/endo-sort.png")} style={styles.filterIcon} />

                        )}
                        <Text style={styles.filterText}>{formatDateText(selectedDate)}</Text>
                        {selectedDate && (
                            <TouchableOpacity onPress={clearFilter} style={{ marginLeft: 8 }} hitSlop={20}>
                                <Image source={require("../assets/icons/close.png")} style={styles.cancelIcon} />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Custom Modal Date Picker */}
            <CustomDatePicker
                visible={showDatePicker}
                initialDate={selectedDate || new Date()}
                onCancel={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                    setSelectedDate(date);
                    applyFilters(date);  // Apply date filter here
                    setShowDatePicker(false);
                }}
            />

            {loading ? (
                <View style={{ marginHorizontal: 16 }}>
                    <KnowledgeCardSkeleton />
                    <KnowledgeCardSkeleton />
                </View>
            ) : posts.length === 0 ? (
                <View style={styles.noPostContainer}>
                    <Text style={styles.noPostText}>No posts available {selectedDate && 'for the selected date.'}</Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={({ item }) => <KnowledgeCard item={item} />}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            )}

        </SafeAreaView>
    );
};

export default HubScreen;

const styles = StyleSheet.create({
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
    headerText: { fontFamily: FontFamily.SemiBold, fontSize: 20, fontWeight: "600", lineHeight: 28, color: colors.text },
    filterContainer: { flexDirection: "row", alignItems: "center" },
    filterButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderRadius: 9999, borderColor: colors.textInputBorderColor },
    filterIcon: { width: 16, height: 16, tintColor: colors.text, marginRight: 8 },
    cancelIcon: { width: 20, height: 20, tintColor: colors.text },
    filterText: { fontFamily: FontFamily.Medium, fontSize: 16, lineHeight: 24, color: colors.text },
    separator: { height: 8, backgroundColor: colors.itemSeparateColor },
    noPostContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
    noPostText: { fontFamily: FontFamily.Medium, fontSize: 16, color: colors.text },
});
