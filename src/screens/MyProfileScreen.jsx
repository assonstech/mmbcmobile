import React, { useEffect, useState } from "react";
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import { getFullImageUrl } from "../common/HttpSerivce";
import { getMemberTypes } from "../controllers/MemberController";
import ImageViewing from "react-native-image-viewing";


const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

// Skeleton Box Component
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

const InfoCard = ({ title, value, loading }) => (
    <View style={styles.infoCard}>
        <Text style={styles.label}>{title}</Text>
        {loading ? (
            <SkeletonBox width="80%" height={20} />
        ) : (
            <Text style={styles.value}>{value || "-"}</Text>
        )}
    </View>
);

const MyProfileScreen = ({ navigation, route }) => {
    const { memberInfo } = route.params;
    const [memberTypeText, setMemberTypeText] = useState("");
    const [loading, setLoading] = useState(true);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

    useEffect(() => {
        const fetchMemberTypes = async () => {
            try {
                const response = await getMemberTypes();
                if (response?.data) {
                    const matchedType = response.data.find(
                        (type) => type.memberTypeId === memberInfo.typeOfMembershipId
                    );

                    if (matchedType) {
                        const text = `${matchedType.memberTypeName} ${matchedType.votingRights ? "- Voting Rights" : "- No Voting Rights"
                            } (${matchedType.fees}/${matchedType.feePeriod})`;
                        setMemberTypeText(text);
                    } else {
                        setMemberTypeText("Unknown Member Type");
                    }
                }
            } catch (error) {
                console.log("Error fetching member types:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMemberTypes();
    }, [memberInfo]);

    const infoFields = [
        { title: "Member Code", value: memberInfo.memberCode },
        { title: "Type of Membership", value: memberTypeText },
        { title: "Address", value: memberInfo.companyOrIndividualAddress },
        { title: "NRC", value: memberInfo.memberNRC },
        { title: "Applicant Position", value: memberInfo.applicantPosition },
        { title: "Nationality", value: memberInfo.memberNationality },
        { title: "Website", value: memberInfo.website },
        { title: "Owner Malaysia %", value: memberInfo.ownerMalaysia },
        { title: "Owner Myanmar %", value: memberInfo.ownerMyanmar },
        { title: "Owner Other %", value: memberInfo.ownerOther },
        { title: "Nature of Business", value: memberInfo.natureOfBusiness },
        { title: "BOD", value: memberInfo.isBOD ? "Yes" : "No" },
        { title: "Status", value: memberInfo.status },
        { title: "Other Owner Name", value: memberInfo.otherOwnerName },
        { title: "Telephone", value: memberInfo.telephone },
        { title: "Date of Registration", value: memberInfo.dateOfRegistration },
        { title: "Place of Registration", value: memberInfo.placeOfRegistration },
        { title: "Owner Type", value: memberInfo.ownerType },
        { title: "WhatsApp", value: memberInfo.whatsApp },
        { title: "Member Position", value: memberInfo.memberPosition },
        { title: "Representative Name", value: memberInfo.representiveName },
        { title: "Representative Position", value: memberInfo.representivePosition },
        { title: "Representative NRC", value: memberInfo.representiveNRC },
        { title: "Representative Nationality", value: memberInfo.representiveNationality },
        { title: "Applicant Name", value: memberInfo.applicantName },
        { title: "Application Date", value: memberInfo.applicationDate },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Background Logo */}
            <View style={styles.logoContainer}>
                <Image
                    source={require("../../src/assets/images/profileBg.png")}
                    style={styles.backgroundLogo}
                />
            </View>

            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <Image
                    source={require("../../src/assets/icons/arrowleft.png")}
                    style={styles.backIcon}
                />
            </TouchableOpacity>

            {/* Main Card Section */}
            <View style={styles.cardContainer}>
                {/* Profile Image */}
                <TouchableOpacity style={styles.profileWrapper} onPress={() => setIsImageViewerVisible(true)}>
                    {loading ? (
                        <SkeletonBox width="100%" height="100%" borderRadius={65.5} />
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
                </TouchableOpacity>

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
                            <Text style={styles.nameText}>{memberInfo?.companyOrIndividualName || "No Name"}</Text>
                            <Text style={styles.emailText}>{memberInfo?.email || "No Email"}</Text>
                            <Text style={styles.phoneText}>{memberInfo?.phone || "No Phone"}</Text>
                        </>
                    )}
                </View>

                {/* Scrollable Info Cards */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {infoFields.map((item, index) => (
                        <InfoCard key={index} title={item.title} value={item.value} loading={loading} />
                    ))}
                </ScrollView>
            </View>
            <ImageViewing
                images={[{ uri: getFullImageUrl(memberInfo.companyOrIndividualImage) }]}
                imageIndex={0}
                visible={isImageViewerVisible}
                onRequestClose={() => setIsImageViewerVisible(false)}
            />
        </SafeAreaView>
    );
};

export default MyProfileScreen;

/* ------------------------------- Styles ------------------------------- */
const styles = StyleSheet.create({
    container: { flex: 1 },
    logoContainer: { alignItems: "center" },
    backgroundLogo: { width: 270, height: 270, resizeMode: "contain" },

    backButton: {
        position: "absolute",
        top: Platform.OS === "android" ? 40 : 60,
        left: 16,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
    backIcon: { width: 20, height: 20, resizeMode: "contain", tintColor: "#000" },

    cardContainer: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        marginTop: Platform.OS === "android" ? "19%" : "23%",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: "white",
        paddingTop: 80,
        zIndex: 1,
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
    profileImage: { width: "100%", height: "100%", resizeMode: "cover", borderRadius: 65.5 },

    infoContainer: { alignItems: "center", marginBottom: 10 },
    nameText: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 24,
        color: colors.text,
        fontWeight: "600",
        lineHeight: 32,
    },
    emailText: { fontFamily: FontFamily.Medium, fontSize: 16, color: colors.loginAccountColor, marginTop: 4 },
    phoneText: { fontFamily: FontFamily.Medium, fontSize: 16, color: colors.loginAccountColor, marginTop: 2 },

    scrollView: { flex: 1, marginTop: 16 },
    infoCard: {
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: colors.itemSeparateColor,
        borderRadius: 24,
    },
    label: {
        fontFamily: FontFamily.Medium,
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 18,
        color: colors.loginAccountColor,
    },
    value: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        color: colors.text,
    },
});
