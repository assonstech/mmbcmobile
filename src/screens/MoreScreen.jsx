import React, { useCallback, useEffect, useState } from "react";
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import Screen from "../utils/Screen";
import { fetchMemberInfo } from "../controllers/MemberController";
import HttpSerivce, { getFullImageUrl } from "../common/HttpSerivce";
import { useFocusEffect } from "@react-navigation/native";
import { useUserType } from "../utils/useUserType";
import { removeNonMemberProfile } from "../utils/auth";
import MemberDirectoryIcon from "../assets/icons/memberdirectory.png";
import PartnerIcon from "../assets/icons/partner.png";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

/* --------------------------- FieldCard Component --------------------------- */
const FieldCard = ({ icon, label, onPress, disabled }) => (
    <TouchableOpacity
        style={[styles.card, disabled && styles.cardDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
    >
        <View style={styles.cardLeft}>
            <Image source={icon} style={styles.cardIcon} />
            <Text style={styles.label}>{label}</Text>
        </View>
        <Image
            source={require("../../src/assets/icons/endo-arrow-right-01.png")}
            style={styles.arrowIcon}
        />
        {disabled && (
            <View style={styles.memberOnlyOverlay}>
                <View style={styles.memberOnlyPill}>
                    <Text style={styles.memberOnlyText}>Member only</Text>
                </View>
            </View>
        )}
    </TouchableOpacity>
);

/* ---------------------------- Skeleton Loader ---------------------------- */
const SkeletonBox = ({ width, height, borderRadius = 6, style }) => (
    <View
        style={[
            {
                width,
                height,
                borderRadius,
                backgroundColor: "#E0E0E0",
                marginVertical: 6,
                overflow: "hidden",
            },
            style,
        ]}
    />
);

/* ---------------------------- Main MoreScreen ---------------------------- */
const MoreScreen = ({ navigation }) => {
    const { isMember, isNonMember, loading: userTypeLoading } = useUserType();
    const [memberInfo, setMemberInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMemberInfo();
        setRefreshing(false);
    };

    const handleLogout = async () => {
        try {
            await HttpSerivce.removeAccessToken("token");
            await HttpSerivce.removeIsDefaultPassword();
            await removeNonMemberProfile();
            navigation.reset({
                index: 0,
                routes: [{ name: Screen.Welcome }],
            });
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const loadMemberInfo = async () => {
        try {
            const response = await fetchMemberInfo();
            if (response.success) {
                setMemberInfo(response.data);
            } else {
                console.error("Failed to fetch member:", response.message);
            }
        } catch (error) {
            console.error("Error fetching member info:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchData = async () => {
                if (userTypeLoading) return;

                setLoading(true);
                try {
                    const response = await fetchMemberInfo();
                    if (isActive && response.success) {
                        setMemberInfo(response.data);
                    }
                } catch (error) {
                    console.error("Error fetching member info:", error);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchData();

            return () => {
                isActive = false; // cleanup to avoid setting state on unmounted component
            };
        }, [userTypeLoading])
    );


    const handlePress = (label) => {
        switch (label) {
            case "Organization detail":
                navigation.navigate(Screen.OrganizationDetail);
                break;
            case "Privacy Policy":
                navigation.navigate(Screen.PrivacyPolicy);
                break;
            case "My Profile":
                navigation.navigate(Screen.MyProfile, { memberInfo });
                break;
            case "About Us":
                navigation.navigate(Screen.Note);
                break;
            case "MOU Partners":
                navigation.navigate(Screen.MouPartners);
                break;
            case "Member directory":
                navigation.navigate(Screen.MemberDirectory);
                break;
            case "Change Password":
                navigation.navigate(Screen.ChangePassword);
                break;
            case "Organization chart":
                navigation.navigate(Screen.OrganizationChart);
                break;
            case "Benefits & Affiliation Programs":
                navigation.navigate(Screen.Benefit);
                break;
            case "Delete account":
                navigation.navigate(Screen.DeleteAccount);
                break;
            default:
                console.log("No navigation defined for:", label);
        }
    };

    const memberMenuItems = [
        { label: "My Profile", icon: require("../../src/assets/icons/profileIcon.png"), memberOnly: true },
        { label: "Change Password", icon: require("../../src/assets/icons/key.png"), memberOnly: true },
        { label: "Privacy Policy", icon: require("../../src/assets/icons/shield.png") },
        { label: "About Us", icon: require("../../src/assets/icons/note.png") },
        { label: "MOU Partners", icon: PartnerIcon },
        { label: "Member directory", icon: MemberDirectoryIcon,memberOnly: true },
        { label: "Organization detail", icon: require("../../src/assets/icons/org.png") },
        { label: "Organization chart", icon: require("../../src/assets/icons/people.png"), memberOnly: true },
        { label: "Benefits & Affiliation Programs", icon: require("../../src/assets/icons/benefit.png"), memberOnly: true },
        { label: "Delete account", icon: require("../../src/assets/icons/delete.png") },


    ];

    const menuItems = memberMenuItems;
    const displayName = isNonMember
        ? memberInfo?.companyOrIndividualName || memberInfo?.representiveName || "-"
        : memberInfo?.representiveName || memberInfo?.companyOrIndividualName || "-";
    const displayEmail = memberInfo?.email || "-";
    const displayPhone = memberInfo?.phone || memberInfo?.telephone || "-";

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: colors.background, paddingBottom: Platform.OS === "android" && 70 },
            ]}
        >
            {/* Background Logo */}
            <View style={styles.logoContainer}>
                <Image
                    source={require("../../src/assets/images/profileBg.png")}
                    style={styles.backgroundLogo}
                />
            </View>

            {/* Main Card Section */}
            <View style={styles.cardContainer}>
                {/* Profile Image */}
                <View style={styles.profileWrapper}>
                    {loading ? (
                        <View style={[styles.profileImage, { backgroundColor: "#E0E0E0" }]} />
                    ) : (
                        <Image
                            source={
                                memberInfo?.companyOrIndividualImage
                                    ? { uri: getFullImageUrl(memberInfo.companyOrIndividualImage) }
                                    : require("../../src/assets/images/Default.png")
                            }
                            style={styles.profileImage}
                        />
                    )}
                </View>

                {/* User Info */}
                <View style={styles.infoContainer}>
                    {loading ? (
                        <>
                            <SkeletonBox width={180} height={24} />
                            <SkeletonBox width={220} height={16} />
                            <SkeletonBox width={140} height={16} />

                        </>
                    ) : (
                        <>
                            <Text style={styles.nameText} numberOfLines={2}>
                                {displayName}
                            </Text>
                            {isNonMember && <Text style={styles.userTypeText}>Non-member</Text>}
                            <Text style={styles.emailText}>{displayEmail}</Text>
                            <Text style={styles.phoneText}>{displayPhone}</Text>
                        </>
                    )}
                </View>

                {/* Scrollable Field List */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={{
                        paddingBottom: Platform.OS === "android" ? 180 : 200,
                    }}
                >
                    {loading ? (
                        Array.from({ length: 7 }).map((_, i) => (
                            <SkeletonBox
                                key={i}
                                width={"90%"}
                                height={56}
                                borderRadius={20}
                                style={{ alignSelf: "center", marginBottom: 12 }}
                            />
                        ))
                    ) : (
                        <>
                            {menuItems.map((item, index) => (
                                <FieldCard
                                    key={index}
                                    label={item.label}
                                    icon={item.icon}
                                    disabled={isNonMember && item.memberOnly}
                                    onPress={() => handlePress(item.label)}
                                />
                            ))}
                            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                                <Text style={styles.logoutText}>Logout</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default MoreScreen;

/* ------------------------------- Styles ------------------------------- */
const styles = StyleSheet.create({
    container: { flex: 1 },
    logoContainer: { alignItems: "center" },
    backgroundLogo: { width: 270, height: 270, resizeMode: "contain" },
    cardContainer: {
        ...StyleSheet.absoluteFill,
        flex: 1,
        marginTop: Platform.OS === "android" ? "19%" : "23%",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: "white",
        paddingTop: 80,
    },
    profileWrapper: {
        position: "absolute",
        top: -65,
        alignSelf: "center",
        width: 131,
        height: 131,
        borderRadius: 65.5,
        borderWidth: 4,
        borderColor: "white",
        overflow: "hidden",
        backgroundColor: colors.bottomTabbarLabelColor,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    profileImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 65.5,
    },
    infoContainer: { alignItems: "center", marginBottom: 10 },
    nameText: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 22,
        color: colors.text,
        fontWeight: "600",
        marginHorizontal: Platform.OS === 'android' ? 8 : 16,
        textAlign: 'center',
        flexWrap: "wrap",

    },
    emailText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: colors.loginAccountColor,
        marginTop: 4,
    },
    phoneText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: colors.loginAccountColor,
        marginTop: 2,
    },
    userTypeText: {
        fontFamily: FontFamily.Medium,
        fontSize: 13,
        color: colors.signUpTextColor,
        marginTop: 4,
    },
    scrollView: { flex: 1, marginTop: 16 },
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 16,
        marginBottom: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: colors.itemSeparateColor,
        overflow: "hidden",
    },
    cardDisabled: {
        opacity: 1,
    },
    cardLeft: { flexDirection: "row", alignItems: "center" },
    cardIcon: { width: 28, height: 28, resizeMode: "contain", marginRight: 10 },
    label: { fontFamily: FontFamily.Medium, fontSize: 16, color: colors.text },
    arrowIcon: { width: 20, height: 20, tintColor: colors.loginAccountColor },
    memberOnlyOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.62)",
        alignItems: "center",
        justifyContent: "center",
    },
    memberOnlyPill: {
        minHeight: 28,
        borderRadius: 9999,
        backgroundColor: colors.button,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    memberOnlyText: {
        fontFamily: FontFamily.Medium,
        fontSize: 12,
        color: colors.text,
    },
    button: {
        height: 56,
        borderRadius: 9999,
        justifyContent: "center",
        backgroundColor: colors.logoutButtonColor,
        alignItems: "center",
        marginHorizontal: 16,
        marginTop: 16,
    },
    logoutText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: "500",
        lineHeight: 24,
        color: "white",
    },
});
