import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderWithActions from "../components/HeaderWithActions";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import { fetchMobileMouPartners } from "../controllers/MouPartnerController";
import { getFullImageUrl } from "../common/HttpSerivce";
import Screen from "../utils/Screen";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;
const PAGE_SIZE = 20;
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 10;
const CARD_WIDTH = (Dimensions.get("window").width - (HORIZONTAL_PADDING * 2) - CARD_GAP) / 2;

const MouPartnersScreen = ({ navigation }) => {
    const [partners, setPartners] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadPartners = useCallback(async (nextPage = 1, shouldAppend = false) => {
        if (shouldAppend) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        const result = await fetchMobileMouPartners(nextPage, PAGE_SIZE);

        setPartners((current) => (
            shouldAppend ? [...current, ...result.items] : result.items
        ));
        setPage(nextPage);
        setTotalPages(result.pagination?.totalPages || 1);
        setLoading(false);
        setLoadingMore(false);
    }, []);

    useEffect(() => {
        loadPartners();
    }, [loadPartners]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPartners(1);
        setRefreshing(false);
    };

    const loadMore = () => {
        if (loading || loadingMore || page >= totalPages) return;
        loadPartners(page + 1, true);
    };

    const openPartnerWebsite = (item) => {
        if (!item?.websiteLink) return;

        navigation.navigate(Screen.InAppWebView, {
            url: item.websiteLink,
            title: item.name || "MOU Partner",
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerWrapper}>
                <HeaderWithActions
                    onBackPress={() => navigation.goBack()}
                />
                <Text style={styles.screenTitle}>MOU Partners</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.button} />
                </View>
            ) : (
                <FlatList
                    data={partners}
                    keyExtractor={(item, index) => String(item.id || index)}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    renderItem={({ item }) => (
                        <PartnerCard
                            item={item}
                            onPress={() => openPartnerWebsite(item)}
                        />
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.4}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.listContent,
                        partners.length === 0 && styles.emptyListContent,
                    ]}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No MOU partners available.</Text>
                    }
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator
                                size="small"
                                color={colors.button}
                                style={styles.footerLoader}
                            />
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
};

const PartnerCard = ({ item, onPress }) => {
    const imageUrl = getFullImageUrl(item.iconUrl);
    const [imageLoading, setImageLoading] = useState(false);

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.partnerCard}
            onPress={onPress}
            disabled={!item?.websiteLink}
        >
            <View style={styles.logoBox}>
                {imageLoading && (
                    <ActivityIndicator
                        size="small"
                        color={colors.button}
                        style={styles.imageLoader}
                    />
                )}
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.partnerLogo}
                        onLoadStart={() => setImageLoading(true)}
                        onLoadEnd={() => setImageLoading(false)}
                    />
                ) : (
                    <Text style={styles.logoFallback}>{getInitials(item?.name)}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const getInitials = (name) => {
    if (!name) return "-";
    return String(name)
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
};

export default MouPartnersScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bottomTabbarLabelColor,
    },
    headerWrapper: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    listContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 4,
        paddingBottom: 120,
    },
    emptyListContent: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    columnWrapper: {
        justifyContent: "space-between",
        marginBottom: 24,
    },
    partnerCard: {
        width: CARD_WIDTH,
        minHeight: 168,
    },
    logoBox: {
        width: "100%",
        height: 168,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.textInputBorderColor,
        backgroundColor: "rgba(255,255,255,0.35)",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    partnerLogo: {
        width: "84%",
        height: "84%",
        resizeMode: "contain",
    },
    imageLoader: {
        position: "absolute",
        zIndex: 1,
    },
    logoFallback: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 22,
        color: colors.text,
    },
    screenTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 24,
        fontWeight: "700",
        color: colors.text,
        marginTop: 18,
        marginBottom: 12,
    },
    emptyText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: colors.text,
        textAlign: "center",
    },
    footerLoader: {
        marginTop: 8,
        marginBottom: 16,
    },
});
