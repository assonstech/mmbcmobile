import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { da } from "date-fns/locale";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const HubScreen = () => {
    const LIMIT = 10;
    const listRef = useRef(null); // ✅


    const [posts, setPosts] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 🔥 Pagination states
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const handleToggleExpand = useCallback((id, isExpanded, index) => {
        if (!isExpanded) {
            // wait one frame so collapse layout is applied
            requestAnimationFrame(() => {
                listRef.current?.scrollToIndex({
                    index,
                    animated: true,
                    viewPosition: 0, // 0 = top of screen
                    viewOffset: 8,  // add small padding (adjust)
                });
            });
        }
    }, []);

    const loadPosts = async (pageNumber = 1, append = false) => {
        try {
            const data = await fetchKnowledgePosts(pageNumber, LIMIT);
            console.log("data", data)

            const formattedData = data?.map(item => ({
                id: item.id.toString(),
                name: item.createdBy || "Admin",
                timeAgo: timeAgo(item.createdAt),
                createdAt: item.createdAt,
                description: item.content,
                image: item.image ? { uri: getFullImageUrl(item.image) } : null,
            })) || [];

            if (append) {
                setPosts(prev => [...prev, ...formattedData]);
                setAllPosts(prev => [...prev, ...formattedData]);
            } else {
                setPosts(formattedData);
                setAllPosts(formattedData);
            }

            if (formattedData.length < LIMIT) {
                setHasMore(false); // no more pages
            } else {
                setHasMore(true);
            }

        } catch (err) {
            console.log("Error fetching posts:", err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchData = async () => {
                if (isActive) {
                    setLoading(true);
                    setPage(1);
                    await loadPosts(1, false);
                    setLoading(false);
                }
            };

            fetchData();

            return () => { isActive = false; };
        }, [])
    );

    // 🔄 Pull to refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(1);
        await loadPosts(1, false);
        setRefreshing(false);
        setHasMore(true);
    }, []);

    // 🔥 Load next page when user scrolls
    const loadMore = async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        const nextPage = page + 1;
        await loadPosts(nextPage, true);
        setPage(nextPage);
        setLoadingMore(false);
    };

    // --------------- Filters ----------------
    const applyFilters = (date) => {
        let filtered = allPosts;
        if (date) {
            const selectedStr = date.toDateString();
            filtered = filtered.filter(
                post => new Date(post.createdAt).toDateString() === selectedStr
            );
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

            {/* Date Picker */}
            <CustomDatePicker
                visible={showDatePicker}
                initialDate={selectedDate || new Date()}
                onCancel={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                    setSelectedDate(date);
                    applyFilters(date);
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
                    ref={listRef}
                    data={posts}
                    renderItem={({ item, index }) => <KnowledgeCard item={item} index={index} onToggleExpand={handleToggleExpand} />}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    refreshing={refreshing}
                    onRefresh={onRefresh}

                    // 🔥 Pagination trigger
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}

                    // 🔥 Bottom loader
                    ListFooterComponent={
                        loadingMore ? <Text style={{ textAlign: "center", color: colors.text, padding: 16 }}>loading...</Text> : null
                    }
                    onScrollToIndexFailed={(info) => {
                        // fallback: try approximate offset then retry
                        const offset = info.averageItemLength * info.index;
                        listRef.current?.scrollToOffset({ offset, animated: true });
                        setTimeout(() => {
                            listRef.current?.scrollToIndex({
                                index: info.index,
                                animated: true,
                                viewPosition: 0,
                                viewOffset: 12,
                            });
                        }, 50);
                    }}
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
