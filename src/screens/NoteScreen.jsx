import React, { useEffect, useState } from "react";
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Dimensions,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import ImageViewing from "react-native-image-viewing";
import { fetchNote } from "../controllers/NoteController";
import { getFullImageUrl } from "../common/HttpSerivce";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;
const { width } = Dimensions.get("window");

// Horizontal Profile Card Component
const HorizontalProfileCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.horizontalCard} onPress={onPress} activeOpacity={0.8}>
        <Image source={item.image} style={styles.horizontalImage} />
        <View style={styles.overlay}>
            <Text style={styles.overlayName}>{item.name}</Text>
            <Text style={styles.overlayInfo}>{item.phone}</Text>
            <Text style={styles.overlayInfo}>{item.email}</Text>
        </View>
    </TouchableOpacity>
);

const MyProfileScreen = ({ navigation }) => {
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [ceo, setCeo] = useState({ name: "", profileImage: "", position: "" });
    const [noteMessage, setNoteMessage] = useState("");
    const [secretaries, setSecretaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ceoImageLoading, setCeoImageLoading] = useState(true);



    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true); // start loading

                // Fetch public CEO/note info. Do not call member-only APIs here,
                // because non-member tokens can be rejected and trigger logout.
                const noteRes = await fetchNote();
                if (noteRes) {
                    const noteData = noteRes.data || noteRes;
                    const ceoData = Array.isArray(noteData.CEO)
                        ? noteData.CEO[0]
                        : noteData.CEO;

                    setCeo({
                        name: ceoData?.representiveName || ceoData?.name || "",
                        profileImage: ceoData?.companyOrIndividualImage || ceoData?.photoPath || "",
                        position: ceoData?.ecPosition || ceoData?.position || "President",
                    });
                    setNoteMessage(noteData.noteMessage || "");
                    setSecretaries(
                        noteData.Secretaries?.map((sec, index) => ({
                            id: index.toString(), // ensure unique key
                            name: sec.name,
                            phone: sec.phone,
                            email: sec.email,
                            image: { uri: getFullImageUrl(sec.photoPath) },
                        })) || []
                    );
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false); // end loading
            }
        };

        fetchData();
    }, []);

    const openImageViewer = (image) => {
        setSelectedImage(image);
        setIsImageViewerVisible(true);
    };

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

            {/* Main Card */}
            <View style={styles.cardContainer}>
                {/* Profile Image */}
                <TouchableOpacity
                    style={styles.profileWrapper}
                    onPress={() => openImageViewer({ uri: getFullImageUrl(ceo.profileImage) })}
                >
                    <Image
                        source={ceo.profileImage
                            ? { uri: getFullImageUrl(ceo.profileImage) }
                            : null
                        }
                        style={styles.profileImage}
                    />
                </TouchableOpacity>

                {/* User Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.nameText}>{ceo.name}</Text>
                    <Text style={styles.emailText}>{ceo.position}</Text>
                </View>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Message Section */}
                    <View style={styles.message}>
                        {loading ? (
                            <View style={styles.skeletonMessage} />
                        ) : (
                            <Text style={styles.messageText}>{noteMessage}</Text>
                        )}
                    </View>

                    {/* Assistant Text */}
                    {loading ? (
                        <View style={styles.skeletonAssistant} />
                    ) : (
                        <Text style={styles.assistantText}>{"Executive Assistant"}</Text>
                    )}

                    {/* Horizontal Scroll Section */}
                    <FlatList
                        horizontal
                        data={loading ? Array(3).fill({}) : secretaries}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
                        renderItem={({ item }) =>
                            loading ? (
                                <View style={styles.skeletonCard} />
                            ) : (
                                <HorizontalProfileCard
                                    item={item}
                                    onPress={() => openImageViewer(item.image)}
                                />
                            )
                        }
                        style={{ marginTop: 16 }}
                    />
                </ScrollView>



            </View>

            {/* Image Viewer */}
            {selectedImage && (
                <ImageViewing
                    images={[{ uri: Image.resolveAssetSource(selectedImage).uri }]}
                    imageIndex={0}
                    visible={isImageViewerVisible}
                    onRequestClose={() => setIsImageViewerVisible(false)}
                />
            )}
        </SafeAreaView>
    );
};

export default MyProfileScreen;

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

    message: {
        padding: 16,
        backgroundColor: colors.itemSeparateColor,
        marginHorizontal: 16,
        borderRadius: 24,
        marginTop: 16,
        justifyContent: "center",
    },
    messageText: {
        fontFamily: FontFamily.Regular,
        fontSize: 16,
        lineHeight: 24,
        color: colors.text,
        textAlign: 'flex-start'
    },
    assistantText: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        lineHeight: 26,
        color: colors.text,
        margin: 16,
    },

    // horizontalCard: {
    //     marginRight: 16,
    //     width: 269,
    //     height: "70%",
    //     borderRadius: 20,
    //     overflow: "hidden",
    //     borderWidth: 1,
    //     borderColor: colors.loginAccountColor
    // },
    // horizontalImage: { width: "100%", height: "100%", resizeMode: "contain" },
    horizontalCard: {
        marginRight: 16,
        width: 260,       
        height: 269,      
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.loginAccountColor
    },
    horizontalImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover", // fill card
    },
    overlay: {
        position: "absolute",
        bottom: -1,
        left: 0,
        right: 0,
        height: "40%",
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
        padding: 12,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    overlayName: {
        color: "#fff",
        fontFamily: FontFamily.SemiBold,
        fontSize: 22,
        fontWeight: "600",
        lineHeight: 32,
    },
    overlayInfo: {
        color: "#fff",
        fontFamily: FontFamily.Medium,
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 20,
    },
    skeletonCard: {
        marginRight: 16,
        width: 269,
        height: "70%", // same approximate height as horizontal card
        borderRadius: 20,
        backgroundColor: "#E0E0E0", // light gray skeleton
    },
    skeletonMessage: {
        width: "100%",
        height: 200, // adjust to match your real message height
        borderRadius: 24,
        backgroundColor: "#E0E0E0", // light gray skeleton
    },
    skeletonAssistant: {
        width: 200, // approximate width of the text
        height: 26, // same as lineHeight of assistantText
        borderRadius: 8,
        backgroundColor: "#E0E0E0", // light gray placeholder
        margin: 16,
    },


});
