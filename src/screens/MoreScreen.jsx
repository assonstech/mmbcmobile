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

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

/* --------------------------- FieldCard Component --------------------------- */
const FieldCard = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.cardLeft}>
            <Image source={icon} style={styles.cardIcon} />
            <Text style={styles.label}>{label}</Text>
        </View>
        <Image
            source={require("../../src/assets/icons/endo-arrow-right-01.png")}
            style={styles.arrowIcon}
        />
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
            navigation.reset({
                index: 0,
                routes: [{ name: Screen.Login }],
            });
            console.log("User logged out successfully");
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
        }, [])
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
            case "Note":
                navigation.navigate(Screen.Note);
                break;
            case "Change Password":
                navigation.navigate(Screen.ChangePassword);
                break;
            case "Organization chart":
                navigation.navigate(Screen.OrganizationChart);
                break;
            default:
                console.log("No navigation defined for:", label);
        }
    };

    const menuItems = [
        { label: "My Profile", icon: require("../../src/assets/icons/profileIcon.png") },
        { label: "Change Password", icon: require("../../src/assets/icons/key.png") },
        { label: "Privacy Policy", icon: require("../../src/assets/icons/shield.png") },
        { label: "Note", icon: require("../../src/assets/icons/note.png") },
        { label: "Organization detail", icon: require("../../src/assets/icons/org.png") },
        { label: "Organization chart", icon: require("../../src/assets/icons/people.png") },
    ];

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
                                    : require("../../src/assets/images/avatar.png")
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
                            <Text style={styles.nameText}>
                                {memberInfo?.representiveName || "No Name"}
                            </Text>
                            <Text style={styles.emailText}>{memberInfo?.email || "No Email"}</Text>
                            <Text style={styles.phoneText}>{memberInfo?.phone || "No Phone"}</Text>
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
                        Array.from({ length: 5 }).map((_, i) => (
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
        ...StyleSheet.absoluteFillObject,
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
        fontSize: 24,
        color: colors.text,
        fontWeight: "600",
        lineHeight: 32,
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
    },
    cardLeft: { flexDirection: "row", alignItems: "center" },
    cardIcon: { width: 28, height: 28, resizeMode: "contain", marginRight: 10 },
    label: { fontFamily: FontFamily.Medium, fontSize: 16, color: colors.text },
    arrowIcon: { width: 20, height: 20, tintColor: colors.loginAccountColor },
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
