import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    ScrollView,
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
import { fetchNewsletterById } from "../controllers/NewsletterController";
import { getFullImageUrl } from "../common/HttpSerivce";
import { timeAgo } from "../utils/timeHelper";
import CalendarIcon from "../assets/icons/endo-calendar.png";
import ImageViewing from "react-native-image-viewing";
import DocumentOverlay from "../components/DocumentOverlay";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const NewsletterDetailScreen = ({ navigation, route }) => {
    const { item } = route?.params || {};
    const [newsletter, setNewsletter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageVisible, setImageVisible] = useState(false);
    const [documentOverlay, setDocumentOverlay] = useState(null);

    useEffect(() => {
        let isActive = true;

        const loadDetail = async () => {
            if (!item?.newsletterId) {
                if (isActive) setLoading(false);
                return;
            }

            const detail = await fetchNewsletterById(item.newsletterId);
            if (isActive) {
                setNewsletter(detail || null);
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

    if (!newsletter) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerWrapper}>
                    <HeaderWithActions title="Detail" onBackPress={() => navigation.goBack()} />
                </View>
                <View style={styles.notFoundContainer}>
                    <View style={styles.notFoundIconWrapper}>
                        <Image source={CalendarIcon} style={styles.notFoundIcon} resizeMode="contain" />
                    </View>
                    <Text style={styles.notFoundTitle}>Newsletter not found</Text>
                    <Text style={styles.notFoundDescription}>
                        This newsletter may have been removed or is no longer available.
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

    const fileUrl = newsletter?.pdfUrl ? getFullImageUrl(newsletter.pdfUrl) : null;

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
                {newsletter?.imageUrl && (
                    <>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={styles.imageWrapper}
                            onPress={() => setImageVisible(true)}
                        >
                            {imageLoading && (
                                <ActivityIndicator
                                    size="large"
                                    color="#0000ff"
                                    style={styles.imageLoader}
                                />
                            )}
                            <ImageBackground
                                source={{ uri: getFullImageUrl(newsletter.imageUrl) }}
                                style={styles.heroImage}
                                resizeMode="cover"
                                onLoadStart={() => setImageLoading(true)}
                                onLoadEnd={() => setImageLoading(false)}
                            >
                                <View style={styles.imageOverlay} />
                            </ImageBackground>
                        </TouchableOpacity>

                        <ImageViewing
                            images={[{ uri: getFullImageUrl(newsletter.imageUrl) }]}
                            imageIndex={0}
                            visible={imageVisible}
                            onRequestClose={() => setImageVisible(false)}
                        />
                    </>
                )}

                <View style={styles.contentWrapper}>
                    <View style={styles.metaRow}>
                        <View style={styles.metaIconBox}>
                            <Image source={CalendarIcon} style={styles.metaIcon} />
                        </View>
                        <Text style={styles.metaText}>
                            {timeAgo(newsletter?.publishedAt || newsletter?.createdDate)} / {newsletter?.readMinutes || 3}min read
                        </Text>
                    </View>

                    <Text style={styles.title}>{newsletter?.title || "News Title"}</Text>

                    <Text style={styles.description}>
                        {newsletter?.fullDescription || "-"}
                    </Text>
                </View>

                {fileUrl && (
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.fileButton}
                        onPress={() =>
                            setDocumentOverlay({
                                url: fileUrl,
                                title: newsletter?.title || "Document",
                            })
                        }
                    >
                        <Text style={styles.fileButtonText}>View File</Text>
                    </TouchableOpacity>
                )}


                <DocumentOverlay
                    visible={!!documentOverlay}
                    url={documentOverlay?.url}
                    title={documentOverlay?.title}
                    onClose={() => setDocumentOverlay(null)}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default NewsletterDetailScreen;

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
        paddingBottom: 120,
    },
    contentWrapper: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
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
        fontSize: 13,
        color: colors.loginAccountColor,
    },
    title: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 22,
        fontWeight: "700",
        color: colors.text,
        lineHeight: 30,
        marginBottom: 14,
    },
    description: {
        fontFamily: FontFamily.Regular,
        fontSize: 16,
        lineHeight: 24,
        color: colors.text,
        marginBottom: 14,
    },
    imageWrapper: {
        width: "100%",
        height: 221,
        overflow: "hidden",
        backgroundColor: colors.itemSeparateColor,
    },
    heroImage: {
        flex: 1,
        justifyContent: "flex-start",
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    imageLoader: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -12 }, { translateY: -12 }],
        zIndex: 1,
    },
    fileButton: {
        alignSelf: "flex-start",
        backgroundColor: "#5A1E08",
        borderRadius: 9999,
        paddingHorizontal: 20,
        paddingVertical: 13,
        marginHorizontal: 16,
    },
    fileButtonText: {
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        color: "white",
    },
});
