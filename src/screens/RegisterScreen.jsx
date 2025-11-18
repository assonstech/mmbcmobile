import React, { useState, useEffect, useRef } from "react";
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
    TextInput,
    KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HttpSerivce, { getFullImageUrl } from "../common/HttpSerivce";
import { getNrcTypes, getTownshipsByCode, getMemberTypes, createMember } from "../controllers/MemberController";
import ImageViewing from "react-native-image-viewing";
import CustomBottomSheet from "../components/CustomBottomSheet";
import ImagePicker from "react-native-image-crop-picker";
import CustomAlertModal from "../components/CustomAlertModal";
import DefaultButton from "../components/DefaultButton";
import Screen from "../utils/Screen";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const SkeletonBox = ({ width, height, borderRadius = 6, style }) => (
    <View
        style={[
            { width, height, borderRadius, backgroundColor: "#E0E0E0", marginVertical: 6, overflow: "hidden" },
            style,
        ]}
    />
);

const RegisterScreen = ({ navigation }) => {
    const [profileImage, setProfileImage] = useState(null);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [imageBottomSheetVisible, setImageBottomSheetVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertAction, setAlertAction] = useState(() => () => setAlertVisible(false));

    const [membershipOptions, setMembershipOptions] = useState([]);
    const [imageError, setImageError] = useState("");


    const [form, setForm] = useState({
        typeOfMembershipId: "",
        companyOrIndividualName: "",
        email: "",
        phone: "",
        companyOrIndividualImage: "",
        companyOrIndividualAddress: "",
        memberNRC: "",
        isBOD: false,
        status: "Pending",
        representiveName: "",
        representivePosition: "",
        representiveNationality: "",
        passwordHash: "",
        isCEO: false
    });

    const [nrcTypes, setNrcTypes] = useState([]);
    const [selectedState, setSelectedState] = useState("1");
    const [selectedTownship, setSelectedTownship] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [nrcNumber, setNrcNumber] = useState("");
    const [nrcTownships, setNrcTownships] = useState([]);
    const [nrcErrors, setNrcErrors] = useState({});
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        (async () => {
            const types = await getNrcTypes();
            setNrcTypes(types);
            if (types.length > 0) setSelectedType(types[0].codeEn);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const res = await getMemberTypes();
            if (res.success && Array.isArray(res.data)) {
                const formatted = res.data.map(type => ({
                    label: `${type.memberTypeName}${type.votingRights ? " - Voting Rights" : " - No Voting Rights"} (${type.fees}/${type.feePeriod})`,
                    value: type.memberTypeId
                }));
                setMembershipOptions(formatted);
            }
        })();
    }, []);

    useEffect(() => {
        if (!selectedState) {
            setNrcTownships([]);
            return;
        }
        (async () => {
            try {
                const data = await getTownshipsByCode(selectedState);
                const sorted = Array.isArray(data) ? data.sort((a, b) => a.shortEn.localeCompare(b.shortEn)) : [];
                setNrcTownships(sorted);
            } catch (e) {
                console.error("Township fetch failed:", e);
                setNrcTownships([]);
            }
        })();
    }, [selectedState]);

    useEffect(() => {
        const memberNRC =
            selectedState && selectedTownship && selectedType && nrcNumber
                ? `${selectedState}/${selectedTownship}(${selectedType})${nrcNumber}`
                : "";

        setForm(prev => {
            if (prev.memberNRC === memberNRC) return prev; // ⛔ prevent infinite loop
            return { ...prev, memberNRC };
        });
    }, [selectedState, selectedTownship, selectedType, nrcNumber]);


    const fadeInOverlay = () => Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    const fadeOutOverlay = () => Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();

    const requestAndroidPermissions = async () => {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                ]);
                return Object.values(granted).every((status) => status === PermissionsAndroid.RESULTS.GRANTED);
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const handleChooseImage = async (type) => {
        const hasPermission = await requestAndroidPermissions();
        if (!hasPermission) return;

        try {
            let image;
            if (type === "camera") {
                image = await ImagePicker.openCamera({
                    width: 300,
                    height: 300,
                    cropping: true,
                    cropperCircleOverlay: true,
                    compressImageQuality: 0.8
                });
            } else {
                image = await ImagePicker.openPicker({
                    width: 300,
                    height: 300,
                    cropping: true,
                    cropperCircleOverlay: true,
                    compressImageQuality: 0.8
                });
            }
            if (!image?.path) return;

            // Normalize path for Android/iOS
            setProfileImage(image)

            setImageBottomSheetVisible(false); // close bottom sheet immediately

        } catch (err) {
            if (!err?.message?.toLowerCase().includes("cancel")) {
                console.log("Image picking error:", err);
                setAlertMessage("An error occurred while selecting the image.");
                setAlertVisible(true);
                setAlertAction(() => () => setAlertVisible(false));
            }
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            setAlertMessage("Please fill all required fields correctly.");
            setAlertVisible(true);
            setAlertAction(() => () => setAlertVisible(false));
            return;
        }

        try {
            setUploading(true);
            fadeInOverlay();

            const formData = new FormData();
            formData.append("profileImage", {
                uri: Platform.OS === "ios" ? profileImage.path.replace("file://", "") : profileImage.path,
                type: profileImage.mime,
                name: profileImage.filename || `upload_${Date.now()}.jpg`,
            });

            const res = await HttpSerivce.post("/member/single-upload/profileImage", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("image", res)

            const memberForm = { ...form, companyOrIndividualImage: res?.profileImage };
            const createRes = await createMember(memberForm);
            console.log("repone", createRes)
            if (createRes?.success) {
                setAlertMessage("Register successful!");
                setAlertVisible(true);

                // Proper callback function
                setAlertAction(() => () => {
                    setAlertVisible(false);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: Screen.Login }],
                    });
                });
            } else {
                const msg = "Email already exists";

                setAlertMessage(msg);
                setAlertVisible(true);

                // Proper callback function
                setAlertAction(() => () => {
                    setAlertVisible(false);
                });
            }

        } catch (error) {
            console.log("Submit Error:", error);
            setAlertMessage("An error occurred during submission.");
            setAlertVisible(true);
            setAlertAction(() => () => setAlertVisible(false));
        } finally {
            fadeOutOverlay();
            setUploading(false);
        }
    };

    const handleInputChange = (field, value) => setForm({ ...form, [field]: value });

    const validateForm = () => {
        const errors = {};

        // IMAGE REQUIRED
        if (!profileImage && !form.companyOrIndividualImage) {
            errors.profileImage = "Profile image is required";
            setImageError("Profile image is required");
        } else {
            setImageError("");
        }

        // NRC
        if (!selectedState) errors.state = "State required";
        if (!selectedTownship) errors.township = "Township required";
        if (!selectedType) errors.type = "Type required";
        if (!nrcNumber) errors.number = "Citizen number required";
        else if (nrcNumber.length !== 6) errors.number = "Must be 6 digits";

        // Other fields
        if (!form.representiveName) errors.representiveName = "Name is required";
        if (!form.email) errors.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Invalid email format";

        if (!form.phone) errors.phone = "Phone is required";
        else if (!/^\d{7,15}$/.test(form.phone)) errors.phone = "Invalid phone number";

        if (!form.companyOrIndividualName) errors.companyOrIndividualName = "Company name is required";
        if (!form.companyOrIndividualAddress) errors.companyOrIndividualAddress = "Company address is required";
        if (!form.representivePosition) errors.representivePosition = "Position is required";
        if (!form.representiveNationality) errors.representiveNationality = "Nationality is required";
        if (!form.typeOfMembershipId) errors.typeOfMembershipId = "Membership type is required";
        if (!form.passwordHash) {
            errors.passwordHash = "Password is required";
        } else if (!/^\d{4}$/.test(form.passwordHash)) {
            errors.passwordHash = "Password must be exactly 4 digits";
        }


        setFormErrors(errors);
        setNrcErrors({
            state: errors.state || "",
            township: errors.township || "",
            type: errors.type || "",
            number: errors.number || "",
        });

        return Object.keys(errors).length === 0;
    };


    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image source={require("../../src/assets/icons/arrowleft.png")} style={styles.backIcon} />
            </TouchableOpacity>

            <View style={styles.profileRow}>
                <TouchableOpacity onPress={() => setIsImageViewerVisible(true)}>
                    {form.companyOrIndividualImage || profileImage ? (
                        <Image
                            source={{ uri: profileImage?.path || form.companyOrIndividualImage }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <SkeletonBox width={130} height={130} borderRadius={65} />
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.changePhotoButton} onPress={() => setImageBottomSheetVisible(true)}>
                    <Text style={styles.changePhotoText}>{form.companyOrIndividualImage || profileImage ? "Change Photo" : "Add Photo"}</Text>
                </TouchableOpacity>
            </View>
            {imageError ? (
                <Text style={{ color: "red", marginHorizontal: 33 }}>{imageError}</Text>
            ) : null}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={80}  // adjust if header overlaps
            >


                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Membership Dropdown */}
                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Type of Membership</Text>
                        <Dropdown
                            style={[styles.dropdown, formErrors.typeOfMembership && { borderColor: "red" }]}
                            data={membershipOptions}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Membership"
                            value={form.typeOfMembershipId}
                            onChange={item => handleInputChange("typeOfMembershipId", item.value)}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            containerStyle={{ borderRadius: 12 }}
                        />
                        {formErrors.typeOfMembershipId && <Text style={styles.errorText}>{formErrors.typeOfMembershipId}</Text>}
                    </View>

                    {/* NRC Fields */}
                    <View style={[styles.infoCard, { overflow: "visible" }]}>
                        <Text style={styles.label}>Member NRC</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <View style={{ flex: 1, marginRight: 5, zIndex: 3000 }}>
                                <Dropdown
                                    data={Array.from({ length: 14 }, (_, i) => ({ label: String(i + 1), value: String(i + 1) }))}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="State"
                                    value={selectedState}
                                    onChange={item => { setSelectedState(item.value); setSelectedTownship(""); setNrcErrors(prev => ({ ...prev, state: "" })); }}
                                    style={[styles.dropdown, nrcErrors.state && { borderColor: "red" }]}
                                    maxHeight={200}
                                    dropdownPosition="auto"
                                />
                            </View>
                            <View style={{ flex: 2, marginHorizontal: 5, zIndex: 2000 }}>
                                <Dropdown
                                    data={nrcTownships?.map(t => ({ label: t.shortEn, value: t.shortEn }))}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Township"
                                    value={selectedTownship}
                                    onChange={item => { setSelectedTownship(item.value); setNrcErrors(prev => ({ ...prev, township: "" })); }}
                                    style={[styles.dropdown, nrcErrors.township && { borderColor: "red" }]}
                                    maxHeight={200}
                                    dropdownPosition="auto"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 5, zIndex: 1000 }}>
                                <Dropdown
                                    data={nrcTypes?.map(t => ({ label: `(${t.codeEn})`, value: t.codeEn }))}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Type"
                                    value={selectedType}
                                    onChange={item => { setSelectedType(item.value); setNrcErrors(prev => ({ ...prev, type: "" })); }}
                                    style={[styles.dropdown, nrcErrors.type && { borderColor: "red" }]}
                                    maxHeight={200}
                                    dropdownPosition="auto"
                                />
                            </View>
                        </View>

                        <TextInput
                            style={[styles.input, nrcErrors.number && { borderColor: "red" }]}
                            placeholder="Enter Citizen Number"
                            value={nrcNumber}
                            keyboardType="numeric"
                            maxLength={6}
                            onChangeText={text => setNrcNumber(text.replace(/\D/g, "").slice(0, 6))}
                        />
                        {nrcErrors.number && <Text style={styles.errorText}>{nrcErrors.number}</Text>}
                    </View>

                    {/* Other Fields */}
                    {[
                        { key: "representiveName", label: "Name" },
                        { key: "email", label: "Email" },
                        { key: "passwordHash", label: "Password" },
                        { key: "phone", label: "Phone" },
                        { key: "companyOrIndividualName", label: "Company Name" },
                        { key: "companyOrIndividualAddress", label: "Company Address" },
                        { key: "representivePosition", label: "Position" },
                        { key: "representiveNationality", label: "Nationality" },
                    ].map(field => (
                        <View key={field.key} style={styles.infoCard}>
                            <Text style={styles.label}>{field.label}</Text>
                            <TextInput
                                value={form[field.key]}
                                onChangeText={text => setForm(prev => ({ ...prev, [field.key]: text }))}
                                style={[styles.input, field.key === "companyOrIndividualAddress" && styles.textArea, formErrors[field.key] && { borderColor: "red" }]}
                                placeholder={`Enter ${field.label}`}
                                placeholderTextColor="#999"
                                multiline={field.key === "companyOrIndividualAddress"}
                                numberOfLines={field.key === "companyOrIndividualAddress" ? 4 : 1}
                                keyboardType={field.key === "phone" ? "number-pad" : "default"} // 👈 ADD THIS

                            />
                            {formErrors[field.key] && <Text style={styles.errorText}>{formErrors[field.key]}</Text>}
                        </View>
                    ))}
                    {!imageBottomSheetVisible && (
                        <DefaultButton
                            title="Submit"
                            onPress={handleSubmit}
                            style={{ marginHorizontal: 16, marginVertical: 20 }}
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>



            {/* Submit Button: hide when bottom sheet visible */}


            {/* Image Viewer */}
            {(profileImage || form.companyOrIndividualImage) && (
                <ImageViewing
                    images={[{ uri: profileImage?.path || form.companyOrIndividualImage }]}
                    imageIndex={0}
                    visible={isImageViewerVisible}
                    onRequestClose={() => setIsImageViewerVisible(false)}
                />
            )}

            {/* Bottom Sheet */}
            <CustomBottomSheet visible={imageBottomSheetVisible} onClose={() => setImageBottomSheetVisible(false)}>
                <TouchableOpacity style={styles.sheetButton} onPress={() => handleChooseImage("camera")}>
                    <Text style={styles.sheetButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetButton} onPress={() => handleChooseImage("gallery")}>
                    <Text style={styles.sheetButtonText}>Choose from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.sheetButton, { backgroundColor: "#ccc" }]} onPress={() => setImageBottomSheetVisible(false)}>
                    <Text style={styles.sheetButtonText}>Cancel</Text>
                </TouchableOpacity>
            </CustomBottomSheet>

            {/* Loader */}
            {uploading && (
                <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                    <View style={styles.loaderBox}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loaderText}>Changing Profile Image...</Text>
                    </View>
                </Animated.View>
            )}

            <CustomAlertModal visible={alertVisible} message={alertMessage} confirmText="OK" onConfirm={alertAction} />
        </SafeAreaView>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F6FA" },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#fff", justifyContent: "center", marginHorizontal: 16, marginTop: 30, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
    backIcon: { width: 20, height: 20, tintColor: "#000", resizeMode: "contain" },
    profileRow: { flexDirection: "row", alignItems: "center", marginTop: 30, marginHorizontal: 20, gap: 16 },
    profileImage: { width: 130, height: 130, borderRadius: 65, borderWidth: 2, borderColor: colors.primary },
    changePhotoButton: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, marginLeft: 10 },
    changePhotoText: { color: "#fff", fontFamily: FontFamily.Medium, fontSize: 14 },
    scrollView: { flex: 1, marginTop: 20, paddingBottom: 20 },
    infoCard: { padding: 16, marginHorizontal: 16 },
    label: { fontFamily: FontFamily.Medium, fontSize: 13, color: "#555", marginBottom: 8 },
    input: { borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, fontFamily: FontFamily.Medium, backgroundColor: "#FAFAFA", marginBottom: 10 },
    textArea: { height: 100, textAlignVertical: "top" },
    dropdown: { height: 50, borderColor: "#ccc", borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, backgroundColor: "#FAFAFA", marginBottom: 10 },
    placeholderStyle: { color: "#999", fontSize: 16 },
    selectedTextStyle: { fontSize: 16, color: "#000" },
    sheetButton: { paddingVertical: 16, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.primary, marginVertical: 6 },
    sheetButtonText: { color: "#fff", fontFamily: FontFamily.Medium, fontSize: 16 },
    overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", zIndex: 999 },
    loaderBox: { backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 24, paddingVertical: 20, borderRadius: 14, alignItems: "center" },
    loaderText: { color: "#fff", fontSize: 16, marginTop: 10, fontWeight: "600" },
    errorText: { color: "red", fontSize: 12 }
});
