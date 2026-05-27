import React, { useState, useCallback, useRef } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
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
import { fetchMobileLast90DaysNewsletters } from "../controllers/NewsletterController";
import { fetchActiveSeasonalPromotions } from "../controllers/SeasonalPromotionController";
import { getFullImageUrl } from "../common/HttpSerivce";
import { timeAgo } from "../utils/timeHelper";
import KnowledgeCardSkeleton from "../components/KnowledgeCardSkeleton";
import CustomDatePicker from "../components/CustomDatePicker";
import { useFocusEffect } from "@react-navigation/native";
import Screen from "../utils/Screen";
import CalendarIcon from "../assets/icons/endo-calendar.png";
import ImageViewing from "react-native-image-viewing";
import DocumentOverlay from "../components/DocumentOverlay";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;
const HUB_TABS = ["HR Working groups", "Newsletter", "Seasonal promotions"];

const HubScreen = ({ navigation }) => {
    const LIMIT = 10;
    const listRef = useRef(null); // ✅


    const [activeTab, setActiveTab] = useState(HUB_TABS[0]);
    const [posts, setPosts] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    const [allNewsletters, setAllNewsletters] = useState([]);
    const [newsletterGroups, setNewsletterGroups] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [allPromotions, setAllPromotions] = useState([]);
    const [promotionLoading, setPromotionLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newsletterLoading, setNewsletterLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // 🔥 Pagination states
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [documentOverlay, setDocumentOverlay] = useState(null);

    const openDocumentOverlay = useCallback((url, title = "Document") => {
        setDocumentOverlay({ url, title });
    }, []);

    const closeDocumentOverlay = useCallback(() => {
        setDocumentOverlay(null);
    }, []);

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

            const formattedData = data?.map((item, index) => ({
                id: String(item.id || item.knowledgeId || item.postId || index),
                name: item.createdBy || "Admin",
                timeAgo: timeAgo(item.createdAt || item.createdDate || item.publishedAt),
                createdAt: item.createdAt || item.createdDate || item.publishedAt,
                description: item.content || item.fullDescription || item.description || item.title || "",
                image: item.image || item.imageUrl ? { uri: getFullImageUrl(item.image || item.imageUrl) } : null,
                pdfUrl: item.pdfUrl || item.pdfURL || item.pdfurl || null,
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

    const loadNewsletters = async (filterDate = selectedDate) => {
        try {
            setNewsletterLoading(true);
            const data = await fetchMobileLast90DaysNewsletters(1, 10);
            setAllNewsletters(data);

            const nextData = filterDate
                ? data.filter(item => {
                    const newsletterDate = item.newsDate || item.publishedAt || item.createdDate;
                    return newsletterDate && new Date(newsletterDate).toDateString() === filterDate.toDateString();
                })
                : data;

            setNewsletterGroups(groupNewslettersByDate(nextData));
        } catch (err) {
            console.log("Error fetching newsletters:", err);
        } finally {
            setNewsletterLoading(false);
        }
    };

    const loadPromotions = async (filterDate = selectedDate) => {
        try {
            setPromotionLoading(true);
            const data = await fetchActiveSeasonalPromotions();
            setAllPromotions(data);

            const nextData = filterDate
                ? data.filter(item => {
                    const date = item.updatedDate || item.createdDate;
                    return date && new Date(date).toDateString() === filterDate.toDateString();
                })
                : data;

            setPromotions(nextData);
        } catch (err) {
            console.log("Error fetching seasonal promotions:", err);
        } finally {
            setPromotionLoading(false);
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
    const onRefresh = async () => {
        setRefreshing(true);
        if (activeTab === "Newsletter") {
            await loadNewsletters();
        } else if (activeTab === "Seasonal promotions") {
            await loadPromotions();
        } else {
            setPage(1);
            await loadPosts(1, false);
        }
        setRefreshing(false);
        setHasMore(true);
    };

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
        let filteredNewsletters = allNewsletters;
        let filteredPromotions = allPromotions;

        if (date) {
            const selectedStr = date.toDateString();
            filtered = filtered.filter(
                post => new Date(post.createdAt).toDateString() === selectedStr
            );
            filteredNewsletters = filteredNewsletters.filter(item => {
                const newsletterDate = item.newsDate || item.publishedAt || item.createdDate;
                return newsletterDate && new Date(newsletterDate).toDateString() === selectedStr;
            });
            filteredPromotions = filteredPromotions.filter(item => {
                const promotionDate = item.updatedDate || item.createdDate;
                return promotionDate && new Date(promotionDate).toDateString() === selectedStr;
            });
        }

        setPosts(filtered);
        setNewsletterGroups(groupNewslettersByDate(filteredNewsletters));
        setPromotions(filteredPromotions);
    };

    const clearFilter = () => {
        setSelectedDate(null);
        setPosts(allPosts);
        setNewsletterGroups(groupNewslettersByDate(allNewsletters));
        setPromotions(allPromotions);
    };

    const formatDateText = (date) => {
        if (!date) return "Filter";
        return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };

    const handleTabPress = (tab) => {
        setActiveTab(tab);

        if (tab === "Newsletter" && allNewsletters.length === 0) {
            loadNewsletters();
        }

        if (tab === "Seasonal promotions" && allPromotions.length === 0) {
            loadPromotions();
        }
    };

    const renderHubChips = () => (
        <View style={styles.chipWrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
                contentContainerStyle={styles.chipRow}
            >
                {HUB_TABS.map(tab => {
                    const isSelected = activeTab === tab;
                    return (
                        <TouchableOpacity
                            key={tab}
                            activeOpacity={0.85}
                            style={[styles.hubChip, isSelected && styles.hubChipSelected]}
                            onPress={() => handleTabPress(tab)}
                        >
                            <Text style={styles.hubChipText}>{tab}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    const renderNewsletterSummary = () => {
        if (newsletterLoading) {
            return (
                <View style={{ marginHorizontal: 16 }}>
                    <KnowledgeCardSkeleton />
                    <KnowledgeCardSkeleton />
                </View>
            );
        }

        if (newsletterGroups.length === 0) {
            return (
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={styles.emptyNewsletterContent}
                >
                    <Text style={styles.noPostText}>No newsletters available {selectedDate && 'for the selected date.'}</Text>
                </ScrollView>
            );
        }

        return (
            <FlatList
                data={newsletterGroups}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                    <NewsletterGroupCard
                        group={item}
                        onReadMore={() => navigation.navigate(Screen.NewsletterByDate, {
                            date: item.dateQuery,
                            title: item.title,
                            totalLetters: item.totalLetters || item.items.length,
                        })}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.newsletterListContent}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        );
    };

    const renderSeasonalPromotions = () => {
        if (promotionLoading) {
            return (
                <View style={{ marginHorizontal: 16 }}>
                    <KnowledgeCardSkeleton />
                    <KnowledgeCardSkeleton />
                </View>
            );
        }

        if (promotions.length === 0) {
            return (
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={styles.emptyNewsletterContent}
                >
                    <Text style={styles.noPostText}>No seasonal promotions available {selectedDate && 'for the selected date.'}</Text>
                </ScrollView>
            );
        }

        return (
            <FlatList
                data={promotions}
                keyExtractor={(item, index) => String(item.seasonalPromotionId || item.promotionId || item.id || index)}
                renderItem={({ item }) => (
                    <SeasonalPromotionCard
                        item={item}
                        onReadMore={() => navigation.navigate(Screen.SeasonalPromotionDetail, { item })}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.promotionListContent}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, paddingBottom: 80, backgroundColor: colors.bottomTabbarLabelColor }}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Hub</Text>
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

            {renderHubChips()}

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

            {activeTab === "Newsletter" ? (
                renderNewsletterSummary()
            ) : activeTab === "Seasonal promotions" ? (
                renderSeasonalPromotions()
            ) : loading ? (
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
                    renderItem={({ item, index }) => (
                        <KnowledgeCard
                            item={item}
                            index={index}
                            onToggleExpand={handleToggleExpand}
                            onViewFile={(url) => openDocumentOverlay(url, item.description || "Document")}
                        />
                    )}
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

            <DocumentOverlay
                visible={!!documentOverlay}
                url={documentOverlay?.url}
                title={documentOverlay?.title}
                onClose={closeDocumentOverlay}
            />

        </SafeAreaView>
    );
};

const formatNewsletterDate = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const formatDateBadge = (dateValue) => {
    if (!dateValue) return "NEWSLETTER";

    const date = new Date(dateValue);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "TODAY";
    if (date.toDateString() === yesterday.toDateString()) return "YESTERDAY";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();
};

const formatApiDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const groupNewslettersByDate = (items) => {
    const groups = [];

    items.forEach(item => {
        const date = item.newsDate || item.publishedAt || item.createdDate;
        const key = date ? new Date(date).toDateString() : "Unknown";
        const existing = groups.find(group => group.key === key);

        if (existing) {
            existing.items.push(item);
            existing.totalLetters = item.totalLetters || existing.totalLetters || existing.items.length;
        } else {
            groups.push({
                key,
                label: formatDateBadge(date),
                title: formatNewsletterDate(date),
                dateQuery: formatApiDate(date),
                totalLetters: item.totalLetters || 1,
                items: [item],
            });
        }
    });

    return groups;
};

const getNewsletterPreview = (text) => {
    if (!text) return "-";
    return String(text).replace(/\s+/g, " ").trim();
};

const ImageWithLoader = ({ source, style }) => {
    const [loading, setLoading] = useState(false);
    const [imageVisible, setImageVisible] = useState(false);

    return (
        <>
            <TouchableOpacity activeOpacity={0.9} style={style} onPress={() => setImageVisible(true)}>
                {loading && (
                    <ActivityIndicator
                        size="large"
                        color="#0000ff"
                        style={styles.imageLoader}
                    />
                )}
                <Image
                    source={source}
                    style={styles.fillImage}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                />
            </TouchableOpacity>

            <ImageViewing
                images={[{ uri: source.uri }]}
                imageIndex={0}
                visible={imageVisible}
                onRequestClose={() => setImageVisible(false)}
            />
        </>
    );
};

const NewsletterGroupCard = ({ group, onReadMore }) => {
    const firstNewsletter = group.items[0] || {};

    return (
        <View style={styles.newsletterCard}>
            <Text style={styles.newsletterBadge}>{group.label}</Text>
            <Text style={styles.newsletterDate}>{group.title}</Text>
            <Text style={styles.newsletterPreview} numberOfLines={3}>
                {getNewsletterPreview(firstNewsletter.fullDescription)}
            </Text>

            {firstNewsletter.imageUrl && (
                <ImageWithLoader
                    source={{ uri: getFullImageUrl(firstNewsletter.imageUrl) }}
                    style={styles.newsletterImage}
                />
            )}

            <View style={styles.newsletterFooter}>
                <View style={styles.letterCountPill}>
                    <Text style={styles.letterCountText}>Total: </Text>
                    <Text style={styles.letterCountStrong}>{group.totalLetters || group.items.length} letters</Text>
                </View>
                <TouchableOpacity activeOpacity={0.85} style={styles.readMoreButton} onPress={onReadMore}>
                    <Text style={styles.readMoreText}>Read more</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const SeasonalPromotionCard = ({ item, onReadMore }) => {
    const dateText = formatPromotionListDate(item.updatedDate || item.createdDate);
    const description = item.shortDescription || item.fullDescription || "";

    return (
        <View style={styles.promotionCard}>
            <View style={styles.promotionMetaRow}>
                <View style={styles.promotionMetaIconBox}>
                    <Image source={CalendarIcon} style={styles.promotionMetaIcon} />
                </View>
                <Text style={styles.promotionDate}>{dateText}</Text>
            </View>

            <Text style={styles.promotionTitle}>{item.title || "Seasonal promotions title"}</Text>

            <View style={styles.promotionSummaryRow}>
                <Text style={styles.promotionBody} numberOfLines={4}>
                    {getNewsletterPreview(description)}
                </Text>

                {item.imageUrl && (
                    <Image
                        source={{ uri: getFullImageUrl(item.imageUrl) }}
                        style={styles.promotionThumb}
                    />
                )}
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.promotionReadMoreButton} onPress={onReadMore}>
                <Text style={styles.promotionReadMoreText}>Read more</Text>
            </TouchableOpacity>
        </View>
    );
};

const formatPromotionListDate = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    const formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    return `${formattedDate}, ${formattedTime}`;
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
    noPostText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: colors.text,
        textAlign: "center",
        paddingHorizontal: 24,
    },
    chipWrapper: {
        height: 50,
        justifyContent: "center",
    },
    chipScroll: {
        flexGrow: 0,
    },
    chipRow: {
        paddingHorizontal: 16,
        gap: 8,
        alignItems: "center",
    },
    hubChip: {
        height: 40,
        paddingHorizontal: 14,
        borderRadius: 9999,
        backgroundColor: colors.itemSeparateColor,
        alignItems: "center",
        justifyContent: "center",
    },
    hubChipSelected: {
        backgroundColor: colors.button,
    },
    hubChipText: {
        fontFamily: FontFamily.Medium,
        fontSize: 12,
        color: colors.text,
    },
    newsletterListContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 120,
        gap: 14,
    },
    newsletterCard: {
        backgroundColor: "#FFE1BE",
        borderRadius: 18,
        padding: 14,
    },
    newsletterBadge: {
        fontFamily: FontFamily.Medium,
        fontSize: 12,
        color: "#4A1D0C",
        marginBottom: 6,
    },
    newsletterDate: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 24,
        fontWeight: "700",
        color: "#5A1E08",
        marginBottom: 8,
    },
    newsletterPreview: {
        fontFamily: FontFamily.Regular,
        fontSize: 13,
        lineHeight: 19,
        color: colors.text,
    },
    newsletterImage: {
        width: "100%",
        height: 142,
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 12,
        backgroundColor: colors.itemSeparateColor,
    },
    fillImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    imageLoader: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -12 }, { translateY: -12 }],
        zIndex: 1,
    },
    newsletterFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
    },
    letterCountPill: {
        flexDirection: "row",
        backgroundColor: "#FFEFE0",
        borderRadius: 9999,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    letterCountText: {
        fontFamily: FontFamily.Regular,
        fontSize: 12,
        color: colors.text,
    },
    letterCountStrong: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 12,
        fontWeight: "700",
        color: colors.text,
    },
    readMoreButton: {
        backgroundColor: "#5A1E08",
        borderRadius: 9999,
        paddingHorizontal: 18,
        paddingVertical: 11,
    },
    readMoreText: {
        fontFamily: FontFamily.Medium,
        fontSize: 12,
        color: "white",
    },
    newsletterLoadingCard: {
        margin: 16,
        padding: 18,
        borderRadius: 18,
        backgroundColor: "#FFE1BE",
    },
    emptyNewsletterContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 120,
    },
    newsletterDetailWrapper: {
        flex: 1,
    },
    newsletterDetailHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    detailBackButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F8E7E7",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    detailBackText: {
        fontFamily: FontFamily.Regular,
        fontSize: 28,
        lineHeight: 30,
        color: colors.text,
    },
    newsletterDetailTitle: {
        flex: 1,
        fontFamily: FontFamily.SemiBold,
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
    },
    newsletterDetailContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    newsletterItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.textInputBorderColor,
    },
    newsletterMeta: {
        fontFamily: FontFamily.Medium,
        fontSize: 11,
        color: colors.loginAccountColor,
        marginBottom: 4,
    },
    newsletterItemTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 8,
    },
    newsletterItemBody: {
        fontFamily: FontFamily.Regular,
        fontSize: 13,
        lineHeight: 19,
        color: colors.text,
    },
    seeMoreLink: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 12,
        color: colors.signUpTextColor,
        marginTop: 4,
    },
    newsletterItemImage: {
        width: "100%",
        height: 136,
        borderRadius: 12,
        resizeMode: "cover",
        marginTop: 12,
    },
    promotionListContent: {
        paddingTop: 8,
        paddingBottom: 120,
    },
    promotionCard: {
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.textInputBorderColor,
    },
    promotionMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    promotionMetaIconBox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        backgroundColor: "#5A1E08",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    promotionMetaIcon: {
        width: 12,
        height: 12,
        resizeMode: "contain",
        tintColor: "white",
    },
    promotionDate: {
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        color: colors.loginAccountColor,
    },
    promotionTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 20,
        fontWeight: "700",
        color: colors.text,
        lineHeight: 28,
        marginBottom: 16,
    },
    promotionSummaryRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    promotionBody: {
        fontFamily: FontFamily.Regular,
        flex: 1,
        fontSize: 18,
        lineHeight: 26,
        color: colors.text,
        marginRight: 12,
    },
    promotionThumb: {
        width: 102,
        height: 102,
        borderRadius: 14,
        resizeMode: "cover",
    },
    promotionReadMoreButton: {
        alignSelf: "flex-start",
        backgroundColor: "#5A1E08",
        borderRadius: 9999,
        paddingHorizontal: 18,
        paddingVertical: 13,
        marginTop: 18,
    },
    promotionReadMoreText: {
        fontFamily: FontFamily.Medium,
        fontSize: 13,
        color: "white",
    },
});
