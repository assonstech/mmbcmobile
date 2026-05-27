import React, { useCallback, useEffect, useState } from "react";
import {
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
    const [promotion, setPromotion] = useState(item || null);
    const [documentOverlay, setDocumentOverlay] = useState(null);

    useEffect(() => {
        const loadDetail = async () => {
            const id = item?.seasonalPromotionId || item?.promotionId || item?.id;
            if (!id) return;

            const detail = await fetchSeasonalPromotionById(id);
            if (detail) {
                setPromotion(detail);
            }
        };

        loadDetail();
    }, [item]);

    const displayDate = promotion?.updatedDate || promotion?.createdDate;
    const dateText = formatDetailDate(displayDate);
    const timeText = formatDetailTime(displayDate);
    const documentUrl = promotion?.pdfUrl ? getFullImageUrl(promotion.pdfUrl) : null;

    const openDocumentOverlay = useCallback((url, title = "Document") => {
        setDocumentOverlay({ url, title });
    }, []);

    const closeDocumentOverlay = useCallback(() => {
        setDocumentOverlay(null);
    }, []);

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
                        {dateText}{timeText ? `, ${timeText}` : ""}
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

const formatDetailTime = (dateValue) => {
    if (!dateValue) return "";
    return new Date(dateValue).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
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
