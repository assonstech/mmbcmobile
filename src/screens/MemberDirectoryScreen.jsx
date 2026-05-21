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
import { fetchMobileMemberDirectories } from "../controllers/MemberDirectoryController";
import { getFullImageUrl } from "../common/HttpSerivce";
import Screen from "../utils/Screen";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;
const PAGE_SIZE = 20;
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 10;
const CARD_WIDTH = (Dimensions.get("window").width - (HORIZONTAL_PADDING * 2) - CARD_GAP) / 2;

const MemberDirectoryScreen = ({ navigation }) => {
    const [directories, setDirectories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadDirectories = useCallback(async (nextPage = 1, shouldAppend = false) => {
        if (shouldAppend) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        const result = await fetchMobileMemberDirectories(nextPage, PAGE_SIZE);

        setDirectories((current) => (
            shouldAppend ? [...current, ...result.items] : result.items
        ));
        setPage(nextPage);
        setTotalPages(result.pagination?.totalPages || 1);
        setLoading(false);
        setLoadingMore(false);
    }, []);

    useEffect(() => {
        loadDirectories();
    }, [loadDirectories]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDirectories(1);
        setRefreshing(false);
    };

    const loadMore = () => {
        if (loading || loadingMore || page >= totalPages) return;
        loadDirectories(page + 1, true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerWrapper}>
                <HeaderWithActions onBackPress={() => navigation.goBack()} />
                <Text style={styles.screenTitle}>Member directory</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.button} />
                </View>
            ) : (
                <FlatList
                    data={directories}
                    keyExtractor={(item, index) => String(item.id || index)}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    renderItem={({ item }) => (
                        <DirectoryCard
                            item={item}
                            onPress={() => navigation.navigate(Screen.MemberDirectoryDetail, { item })}
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
                        directories.length === 0 && styles.emptyListContent,
                    ]}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No member directories available.</Text>
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

const DirectoryCard = ({ item, onPress }) => {
    const logoUrl = getFullImageUrl(item.logoUrl);
    const [imageLoading, setImageLoading] = useState(false);

    return (
        <TouchableOpacity activeOpacity={0.85} style={styles.directoryCard} onPress={onPress}>
            <View style={styles.logoBox}>
                {imageLoading && (
                    <ActivityIndicator
                        size="small"
                        color={colors.button}
                        style={styles.imageLoader}
                    />
                )}
                {logoUrl ? (
                    <Image
                        source={{ uri: logoUrl }}
                        style={styles.directoryLogo}
                        onLoadStart={() => setImageLoading(true)}
                        onLoadEnd={() => setImageLoading(false)}
                    />
                ) : (
                    <Text style={styles.logoFallback}>{getInitials(item?.name)}</Text>
                )}
            </View>
            <Text style={styles.directoryName} numberOfLines={2}>
                {item?.name || "-"}
            </Text>
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

export default MemberDirectoryScreen;

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
    directoryCard: {
        width: CARD_WIDTH,
        minHeight: 206,
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
    directoryLogo: {
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
    directoryName: {
        fontFamily: FontFamily.Medium,
        fontSize: 12,
        lineHeight: 17,
        color: colors.text,
        textAlign: "center",
        marginTop: 8,
        paddingHorizontal: 2,
    },
    screenTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 22,
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
