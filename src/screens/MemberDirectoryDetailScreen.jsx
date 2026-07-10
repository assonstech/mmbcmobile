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
import HeaderWithActions from "../components/HeaderWithActions";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import { fetchMobileMemberDirectoryDetail } from "../controllers/MemberDirectoryController";
import { getFullImageUrl } from "../common/HttpSerivce";
import Screen from "../utils/Screen";
import ArrowRightIcon from "../assets/icons/endo-arrow-right-01.png";
import DefaultAvatar from "../assets/images/Default.png";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const isValidWebsiteUrl = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

const MemberDirectoryDetailScreen = ({ navigation, route }) => {
    const { item } = route?.params || {};
    const [directory, setDirectory] = useState(item || null);
    const [loading, setLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(false);

    useEffect(() => {
        const loadDetail = async () => {
            const id = item?.id;
            if (!id) {
                setLoading(false);
                return;
            }

            const detail = await fetchMobileMemberDirectoryDetail(id);
            if (detail) {
                setDirectory(detail);
            }
            setLoading(false);
        };

        loadDetail();
    }, [item]);

    const logoUrl = getFullImageUrl(directory?.logoUrl);
    const members = Array.isArray(directory?.members) ? directory.members : [];
    const websiteUrl =
        typeof directory?.website === "string" ? directory.website.trim() : "";
    const hasWebsite =
        websiteUrl.length > 0 &&
        websiteUrl.toLowerCase() !== "null" &&
        websiteUrl.toLowerCase() !== "undefined" &&
        isValidWebsiteUrl(websiteUrl);

    const openWebsite = () => {
        if (!hasWebsite) return;

        navigation.navigate(Screen.InAppWebView, {
            url: websiteUrl,
            title: directory.name || "Website",
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerWrapper}>
                <HeaderWithActions onBackPress={() => navigation.goBack()} />
                <Text style={styles.screenTitle}>Member directory detail</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.button} />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.logoBox}>
                        {imageLoading && (
                            <ActivityIndicator
                                size="large"
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
                            <Text style={styles.logoFallback}>{getInitials(directory?.name)}</Text>
                        )}
                    </View>

                    <Text style={styles.name}>{directory?.name || "-"}</Text>

                    {!!directory?.subtitle && (
                        <Text style={styles.subtitle}>{directory.subtitle}</Text>
                    )}

                    {!!directory?.description && (
                        <Text style={styles.description}>{directory.description}</Text>
                    )}

                    {hasWebsite && (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.websiteButton}
                            onPress={openWebsite}
                        >
                            <Text style={styles.websiteText}>Website</Text>
                            <Image source={ArrowRightIcon} style={styles.websiteIcon} />
                        </TouchableOpacity>
                    )}

                    <View style={styles.divider} />

                    <Text style={styles.memberTitle}>Member list</Text>

                    {members.length > 0 ? (
                        members.map((member, index) => (
                            <MemberRow
                                key={`${member.memberId || index}`}
                                member={member}
                            />
                        ))
                    ) : (
                        <Text style={styles.emptyMembers}>No members available.</Text>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const MemberRow = ({ member }) => {
    const imageValue =
        member.companyOrIndividualImage ||
        member.profileImage ||
        member.imageUrl ||
        member.logoUrl;
    const imageUrl = getFullImageUrl(imageValue);
    const name =
        member.representiveName ||
        member.companyOrIndividualName ||
        member.name ||
        "-";
    const position = member.representivePosition || member.position || "-";

    return (
        <View style={styles.memberRow}>
            <Image
                source={imageUrl ? { uri: imageUrl } : DefaultAvatar}
                style={styles.memberAvatar}
            />
            <View style={styles.memberInfo}>
                <Text style={styles.memberName} numberOfLines={1}>{name}</Text>
                <Text style={styles.memberPosition} numberOfLines={1}>{position}</Text>
            </View>
        </View>
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

export default MemberDirectoryDetailScreen;

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
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 120,
    },
    screenTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 22,
        fontWeight: "700",
        color: colors.text,
        marginTop: 18,
        marginBottom: 12,
    },
    logoBox: {
        width: "100%",
        height: 276,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.textInputBorderColor,
        backgroundColor: "rgba(255,255,255,0.35)",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    directoryLogo: {
        width: "82%",
        height: "82%",
        resizeMode: "contain",
    },
    imageLoader: {
        position: "absolute",
        zIndex: 1,
    },
    logoFallback: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 34,
        color: colors.text,
    },
    name: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 10,
    },
    subtitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 15,
        lineHeight: 22,
        color: colors.text,
        marginBottom: 14,
    },
    description: {
        fontFamily: FontFamily.Regular,
        fontSize: 15,
        lineHeight: 23,
        color: colors.text,
        marginBottom: 16,
    },
    websiteButton: {
        alignSelf: "flex-start",
        minHeight: 44,
        borderRadius: 9999,
        backgroundColor: colors.button,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 18,
    },
    websiteText: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 14,
        color: colors.text,
        marginRight: 8,
    },
    websiteIcon: {
        width: 18,
        height: 18,
        resizeMode: "contain",
        tintColor: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.textInputBorderColor,
        marginHorizontal: -16,
        marginBottom: 18,
    },
    memberTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 14,
    },
    memberRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },
    memberAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        resizeMode: "cover",
        backgroundColor: colors.itemSeparateColor,
        marginRight: 12,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 15,
        color: colors.text,
        marginBottom: 3,
    },
    memberPosition: {
        fontFamily: FontFamily.Medium,
        fontSize: 13,
        color: colors.loginAccountColor,
    },
    emptyMembers: {
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        color: colors.loginAccountColor,
        textAlign: "center",
        marginTop: 12,
    },
});
