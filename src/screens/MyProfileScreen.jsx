import React, { useEffect, useRef, useState } from "react";
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    PermissionsAndroid,
    Animated,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HttpSerivce, { getFullImageUrl } from "../common/HttpSerivce";
import {
    changeProfileImage,
    getMemberTypes,
    updateCompanyOrIndividualImage,
} from "../controllers/MemberController";
import ImageViewing from "react-native-image-viewing";
import CustomBottomSheet from "../components/CustomBottomSheet";
import ImagePicker from "react-native-image-crop-picker";
import CustomAlertModal from "../components/CustomAlertModal";
import Screen from "../utils/Screen";

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
    const [imageBottomSheetVisible, setImageBottomSheetVisible] =
        useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const [uploading, setUploading] = useState(false);
    const [alertAction, setAlertAction] = useState(
        () => () => setAlertVisible(false)
    );

    const fadeInOverlay = () => {
        Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const fadeOutOverlay = () => {
        Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    /**
     * ✅ Camera-only permission (no storage/media permissions)
     */
    const requestCameraPermission = async () => {
        if (Platform.OS !== "android") return true;

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Camera Permission",
                    message:
                        "We need access to your camera to take a profile photo.",
                    buttonPositive: "OK",
                    buttonNegative: "Cancel",
                }
            );

            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    /**
     * ✅ Uses camera permission only when needed
     * ✅ Gallery uses picker without READ_* storage permissions
     */
    const handleChooseImage = async (type) => {
        try {
            let image;

            if (type === "camera") {
                const hasPermission = await requestCameraPermission();
                if (!hasPermission) return;

                image = await ImagePicker.openCamera({
                    width: 300,
                    height: 300,
                    cropping: true,
                    cropperCircleOverlay: true,
                    compressImageQuality: 0.8,
                });
            } else {
                // Gallery: no extra storage permissions needed
                image = await ImagePicker.openPicker({
                    width: 300,
                    height: 300,
                    cropping: true,
                    cropperCircleOverlay: true,
                    compressImageQuality: 0.8,
                });
            }

            if (!image?.path) return; // User cancelled or invalid

            setUploading(true);
            setImageBottomSheetVisible(false);
            fadeInOverlay();

            const formData = new FormData();
            formData.append("profileImage", {
                uri:
                    Platform.OS === "ios"
                        ? image.path.replace("file://", "")
                        : image.path,
                type: image.mime,
                name: image.filename || `upload_${Date.now()}.jpg`,
            });

            const res = await HttpSerivce.post(
                "/member/single-upload/profileImage",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (res?.profileImage) {
                await updateCompanyOrIndividualImage(res.profileImage);

                setAlertMessage("Profile image updated successfully!");
                setAlertVisible(true);

                setAlertAction(
                    () => () => {
                        setAlertVisible(false);
                        navigation.reset({
                            index: 0,
                            routes: [
                                {
                                    name: Screen.MainTabs,
                                    state: {
                                        index: 2,
                                        routes: [
                                            { name: "Home" },
                                            { name: "Hub" },
                                            { name: "More" },
                                        ],
                                    },
                                },
                            ],
                        });
                    }
                );
            } else {
                setAlertMessage("Failed to upload image.");
                setAlertVisible(true);
                setAlertAction(() => () => setAlertVisible(false));
            }
        } catch (err) {
            if (
                err?.message &&
                err.message.toLowerCase().includes("cancel")
            ) {
                console.log("User cancelled image picker");
            } else {
                console.log("Image picking or upload error:", err);
                setAlertMessage(
                    "An error occurred while uploading the image."
                );
                setAlertVisible(true);
                setAlertAction(() => () => setAlertVisible(false));
            }
        } finally {
            fadeOutOverlay();
            setUploading(false);
        }
    };

    useEffect(() => {
        const fetchMemberTypes = async () => {
            try {
                const response = await getMemberTypes();
                if (response?.data) {
                    const matchedType = response.data.find(
                        (type) =>
                            type.memberTypeId ===
                            memberInfo.typeOfMembershipId
                    );

                    if (matchedType) {
                        const text = `${matchedType.memberTypeName} ${
                            matchedType.votingRights
                                ? "- Voting Rights"
                                : "- No Voting Rights"
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

    const formatDateWithHyphen = (date) => {
        if (!date) return "-";
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) return "-";
        return parsedDate.toISOString().split("T")[0]; // YYYY-MM-DD
    };

    const infoFields = [
        { title: "Name", value: memberInfo.representiveName },
        { title: "Email", value: memberInfo.email },
        { title: "Phone Number", value: memberInfo.telephone },
        { title: "Member Code", value: memberInfo.memberCode },
        { title: "Member Position", value: memberInfo.representivePosition },
        { title: "Member NRC", value: memberInfo.memberNRC },
        { title: "Type of Membership", value: memberTypeText },
        {
            title: "Start Date",
            value: formatDateWithHyphen(memberInfo.startDate),
        },
        {
            title: "End Date",
            value: formatDateWithHyphen(memberInfo.endDate),
        },
        {
            title: "Address",
            value: memberInfo.companyOrIndividualAddress,
        },
        {
            title: "Member Nationality",
            value: memberInfo.representiveNationality,
        },
        { title: "EC Member", value: memberInfo.isBOD ? "Yes" : "No" },
        { title: "Owner Malaysia %", value: memberInfo.ownerMalaysia },
        { title: "Owner Myanmar %", value: memberInfo.ownerMyanmar },
        {
            title: `Owner Other (${memberInfo.otherOwnerName}) %`,
            value: memberInfo.ownerOther,
        },
        { title: "Applicant Name", value: memberInfo.applicantName },
        {
            title: "Applicant Position",
            value: memberInfo.applicantPosition,
        },
        {
            title: "Application Date",
            value: formatDateWithHyphen(
                memberInfo.applicationDate
            ),
        },
        { title: "Website", value: memberInfo.website },
        {
            title: "Nature of Business",
            value: memberInfo.natureOfBusiness,
        },
        { title: "Telephone", value: memberInfo.telephone },
        { title: "Owner Type", value: memberInfo.ownerType },
        {
            title: "Date of Registration",
            value: memberInfo.dateOfRegistration,
        },
        {
            title: "Place of Registration",
            value: memberInfo.placeOfRegistration,
        },
        { title: "WhatsApp", value: memberInfo.whatsApp },
    ];

    return (
        <SafeAreaView style={[styles.container]}>
            {/* Header with Back Button */}
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

            {/* Profile Image Row */}
            <View style={styles.profileRow}>
                {/* Profile Image */}
                <TouchableOpacity
                    onPress={() => setIsImageViewerVisible(true)}
                >
                    {loading ? (
                        <SkeletonBox
                            width={130}
                            height={130}
                            borderRadius={65}
                        />
                    ) : (
                        <Image
                            source={
                                memberInfo?.companyOrIndividualImage
                                    ? {
                                          uri: getFullImageUrl(
                                              memberInfo.companyOrIndividualImage
                                          ),
                                      }
                                    : require("../../src/assets/images/avatar.png")
                            }
                            style={styles.profileImage}
                        />
                    )}
                </TouchableOpacity>

                {/* Change Photo */}
                {!loading && (
                    <TouchableOpacity
                        onPress={() =>
                            setImageBottomSheetVisible(true)
                        }
                    >
                        <Text style={styles.changePhotoText}>
                            Change Photo
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Scrollable Info Cards */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
            >
                {infoFields.map((item, index) => (
                    <InfoCard
                        key={index}
                        title={item.title}
                        value={item.value}
                        loading={loading}
                    />
                ))}
            </ScrollView>

            {/* Image Viewer */}
            {memberInfo?.companyOrIndividualImage && (
                <ImageViewing
                    images={[
                        {
                            uri: getFullImageUrl(
                                memberInfo.companyOrIndividualImage
                            ),
                        },
                    ]}
                    imageIndex={0}
                    visible={isImageViewerVisible}
                    onRequestClose={() =>
                        setIsImageViewerVisible(false)
                    }
                />
            )}

            {/* Bottom Sheet */}
            <CustomBottomSheet
                visible={imageBottomSheetVisible}
                onClose={() => setImageBottomSheetVisible(false)}
            >
                <TouchableOpacity
                    style={styles.sheetButton}
                    onPress={() => handleChooseImage("camera")}
                >
                    <Text style={styles.sheetButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.sheetButton}
                    onPress={() => handleChooseImage("gallery")}
                >
                    <Text style={styles.sheetButtonText}>
                        Choose from Gallery
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.sheetButton,
                        { backgroundColor: "#ccc" },
                    ]}
                    onPress={() => setImageBottomSheetVisible(false)}
                >
                    <Text style={styles.sheetButtonText}>Cancel</Text>
                </TouchableOpacity>
            </CustomBottomSheet>

            {uploading && (
                <Animated.View
                    style={[styles.overlay, { opacity: overlayOpacity }]}
                >
                    <View style={styles.loaderBox}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loaderText}>
                            Changing Profile Image...
                        </Text>
                    </View>
                </Animated.View>
            )}

            <CustomAlertModal
                visible={alertVisible}
                message={alertMessage}
                confirmText="OK"
                onConfirm={alertAction}
            />
        </SafeAreaView>
    );
};

export default MyProfileScreen;

/* ------------------------------- Styles ------------------------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
        marginHorizontal: 16,
        marginTop: 30,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    backIcon: {
        width: 20,
        height: 20,
        tintColor: "#000",
        resizeMode: "contain",
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: Platform.OS === "android" ? 20 : 30,
        marginHorizontal: 20,
        gap: 16,
    },
    profileImage: {
        width: 130,
        height: 130,
        borderRadius: 65,
    },
    changePhotoText: {
        color: "#3B82F6",
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        textDecorationLine: "underline",
    },
    scrollView: { flex: 1, marginTop: 20, paddingTop: 20 },
    infoCard: {
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: colors.itemSeparateColor,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontFamily: FontFamily.Medium,
        fontSize: 12,
        color: colors.loginAccountColor,
        marginBottom: 6,
    },
    value: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: colors.text,
    },
    sheetButton: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: colors.primary,
        marginVertical: 6,
    },
    sheetButtonText: {
        color: "#fff",
        fontFamily: FontFamily.Medium,
        fontSize: 16,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },
    loaderBox: {
        backgroundColor: "rgba(0,0,0,0.7)",
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderRadius: 14,
        alignItems: "center",
    },
    loaderText: {
        color: "#fff",
        fontSize: 16,
        marginTop: 10,
        fontWeight: "600",
    },
});
