import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
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
import { fetchMobileNewslettersByDate } from "../controllers/NewsletterController";
import { getFullImageUrl } from "../common/HttpSerivce";
import { timeAgo } from "../utils/timeHelper";
import Screen from "../utils/Screen";
import CalendarIcon from "../assets/icons/endo-calendar.png";
import ImageViewing from "react-native-image-viewing";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const NewsletterByDateScreen = ({ navigation, route }) => {
    const { date, title = "Newsletter" } = route?.params || {};
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNewsletters = useCallback(async () => {
        if (!date) {
            setItems([]);
            setLoading(false);
            return;
        }

        const data = await fetchMobileNewslettersByDate(date);
        setItems(data);
        setLoading(false);
    }, [date]);

    useEffect(() => {
        loadNewsletters();
    }, [loadNewsletters]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNewsletters();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerWrapper}>
                <HeaderWithActions
                    title={title}
                    onBackPress={() => navigation.goBack()}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.button} />
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item, index) => String(item.newsletterId || index)}
                    renderItem={({ item }) => (
                        <NewsletterListItem
                            item={item}
                            onPress={() => navigation.navigate(Screen.NewsletterDetail, { item })}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No newsletters available.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const NewsletterListItem = ({ item, onPress }) => (
    <TouchableOpacity activeOpacity={0.85} style={styles.item} onPress={onPress}>
        <View style={styles.metaRow}>
            <View style={styles.metaIconBox}>
                <Image source={CalendarIcon} style={styles.metaIcon} />
            </View>
            <Text style={styles.metaText}>
                {timeAgo(item.publishedAt || item.createdDate)} / {item.readMinutes || 3}min read
            </Text>
        </View>

        <Text style={styles.title}>{item.title || "News Title"}</Text>
        <Text style={styles.body} numberOfLines={4}>
            {getPreview(item.fullDescription)}
        </Text>
        <Text style={styles.seeMore}>See more</Text>

        {item.imageUrl && (
            <ImageWithLoader
                source={{ uri: getFullImageUrl(item.imageUrl) }}
                style={styles.itemImage}
            />
        )}
    </TouchableOpacity>
);

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

const getPreview = (text) => {
    if (!text) return "-";
    return String(text).replace(/\s+/g, " ").trim();
};

export default NewsletterByDateScreen;

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
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    item: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.textInputBorderColor,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    metaIconBox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        backgroundColor: "#5A1E08",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    metaIcon: {
        width: 12,
        height: 12,
        resizeMode: "contain",
        tintColor: "white",
    },
    metaText: {
        fontFamily: FontFamily.Medium,
        fontSize: 12,
        color: colors.loginAccountColor,
    },
    title: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 8,
    },
    body: {
        fontFamily: FontFamily.Regular,
        fontSize: 14,
        lineHeight: 20,
        color: colors.text,
    },
    seeMore: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 12,
        color: colors.signUpTextColor,
        marginTop: 4,
    },
    itemImage: {
        width: "100%",
        height: 136,
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
    emptyContainer: {
        paddingTop: 80,
        alignItems: "center",
    },
    emptyText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: colors.text,
    },
});
