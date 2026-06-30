import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import { fetchSeasonalPromotionById } from "../controllers/SeasonalPromotionController";
import { getFullImageUrl } from "../common/HttpSerivce";
import CalendarIcon from "../assets/icons/endo-calendar.png";
import HeaderWithActions from "../components/HeaderWithActions";
import DocumentOverlay from "../components/DocumentOverlay";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const SeasonalPromotionDetailScreen = ({ navigation, route }) => {
    const { item } = route?.params || {};
    const [promotion, setPromotion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [documentOverlay, setDocumentOverlay] = useState(null);

    useEffect(() => {
        let isActive = true;

        const loadDetail = async () => {
            const id = item?.seasonalPromotionId || item?.promotionId || item?.id;
            if (!id) {
                if (isActive) setLoading(false);
                return;
            }

            const detail = await fetchSeasonalPromotionById(id);
            console.log('dat',detail)
            if (isActive) {
                setPromotion(detail || null);
                setLoading(false);
            }
        };

        loadDetail();

        return () => {
            isActive = false;
        };
    }, [item]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerWrapper}>
                    <HeaderWithActions title="Detail" onBackPress={() => navigation.goBack()} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.button} />
                </View>
            </SafeAreaView>
        );
    }

    if (!promotion) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerWrapper}>
                    <HeaderWithActions title="Detail" onBackPress={() => navigation.goBack()} />
                </View>
                <View style={styles.notFoundContainer}>
                    <View style={styles.notFoundIconWrapper}>
                        <Image source={CalendarIcon} style={styles.notFoundIcon} resizeMode="contain" />
                    </View>
                    <Text style={styles.notFoundTitle}>Seasonal promotion not found</Text>
                    <Text style={styles.notFoundDescription}>
                        This promotion may have been removed or is no longer available.
                    </Text>
                    <TouchableOpacity
                        style={styles.notFoundButton}
                        activeOpacity={0.85}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.notFoundButtonText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isInactive =
        promotion.isActive === false ||
        promotion.isActive === 0 ||
        promotion.isActive === "false";

    if (isInactive) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerWrapper}>
                    <HeaderWithActions title="Detail" onBackPress={() => navigation.goBack()} />
                </View>
                <View style={styles.notFoundContainer}>
                    <View style={styles.inactiveIconWrapper}>
                        <Image source={CalendarIcon} style={styles.inactiveIcon} resizeMode="contain" />
                    </View>
                    <Text style={styles.notFoundTitle}>Promotion no longer active</Text>
                    <Text style={styles.notFoundDescription}>
                        This seasonal promotion has ended or is currently unavailable.
                    </Text>
                    <TouchableOpacity
                        style={styles.notFoundButton}
                        activeOpacity={0.85}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.notFoundButtonText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const displayDate = promotion?.updatedDate || promotion?.createdDate;
    const dateText = formatDetailDate(displayDate);
    const documentUrl = promotion?.pdfUrl ? getFullImageUrl(promotion.pdfUrl) : null;

    const openDocumentOverlay = (url, title = "Document") => {
        setDocumentOverlay({ url, title });
    };

    const closeDocumentOverlay = () => {
        setDocumentOverlay(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerWrapper}>
                <HeaderWithActions
                    title="Detail"
                    onBackPress={() => navigation.goBack()}
                />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.metaRow}>
                    <View style={styles.metaIconBox}>
                        <Image source={CalendarIcon} style={styles.metaIcon} />
                    </View>
                    <Text style={styles.metaText}>
                        {dateText}
                    </Text>
                </View>

                <Text style={styles.title}>{promotion?.title || "Seasonal promotions title"}</Text>

                {!!promotion?.shortDescription && (
                    <Text style={styles.shortDescription}>
                        {promotion.shortDescription}
                    </Text>
                )}

                {promotion?.imageUrl && (
                    <Image
                        source={{ uri: getFullImageUrl(promotion.imageUrl) }}
                        style={styles.heroImage}
                    />
                )}

                <Text style={styles.fullDescription}>
                    {promotion?.fullDescription || promotion?.shortDescription || "-"}
                </Text>

                {documentUrl && (
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.pdfButton}
                        onPress={() => openDocumentOverlay(documentUrl, promotion?.title || "Document")}
                    >
                        <Text style={styles.pdfButtonText}>View File</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <DocumentOverlay
                visible={!!documentOverlay}
                url={documentOverlay?.url}
                title={documentOverlay?.title}
                onClose={closeDocumentOverlay}
            />
        </SafeAreaView>
    );
};

const formatDetailDate = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

export default SeasonalPromotionDetailScreen;

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
    notFoundContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingBottom: 80,
    },
    notFoundIconWrapper: {
        width: 84,
        height: 84,
        borderRadius: 42,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F3F4F6",
        marginBottom: 22,
    },
    notFoundIcon: {
        width: 38,
        height: 38,
        tintColor: "#6B7280",
    },
    inactiveIconWrapper: {
        width: 84,
        height: 84,
        borderRadius: 42,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF4D6",
        marginBottom: 22,
    },
    inactiveIcon: {
        width: 38,
        height: 38,
        tintColor: "#B7791F",
    },
    notFoundTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 22,
        lineHeight: 30,
        fontWeight: "700",
        color: colors.text,
        textAlign: "center",
        marginBottom: 8,
    },
    notFoundDescription: {
        maxWidth: 300,
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        lineHeight: 22,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 26,
    },
    notFoundButton: {
        minWidth: 190,
        minHeight: 50,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: colors.button,
    },
    notFoundButtonText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },
    metaIconBox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        backgroundColor: "#5A1E08",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    metaIcon: {
        width: 13,
        height: 13,
        resizeMode: "contain",
        tintColor: "white",
    },
    metaText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: colors.loginAccountColor,
    },
    title: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 22,
        fontWeight: "700",
        color: colors.text,
        lineHeight: 30,
        marginBottom: 18,
    },
    shortDescription: {
        fontFamily: FontFamily.Regular,
        fontSize: 18,
        lineHeight: 28,
        color: colors.text,
        marginBottom: 12,
    },
    heroImage: {
        width: "100%",
        height: 388,
        borderRadius: 14,
        resizeMode: "cover",
        marginBottom: 12,
    },
    fullDescription: {
        fontFamily: FontFamily.Regular,
        fontSize: 18,
        lineHeight: 28,
        color: colors.text,
    },
    pdfButton: {
        alignSelf: "flex-start",
        backgroundColor: "#5A1E08",
        borderRadius: 9999,
        paddingHorizontal: 20,
        paddingVertical: 13,
        marginTop: 18,
    },
    pdfButtonText: {
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        color: "white",
    },
});
