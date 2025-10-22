import React, { useState } from "react";
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import ImageViewing from "react-native-image-viewing";

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

    // Sample horizontal images
    const horizontalData = [
        {
            id: "1",
            image: require("../../src/assets/images/image.png"),
            name: "Mr. Frank Chair Man",
            phone: "+1 234 567 890",
            email: "ceo@institute.com",
        },
        {
            id: "2",
            image: require("../../src/assets/images/image.png"),
            name: "Ms. Jane Doe",
            phone: "+1 987 654 321",
            email: "assistant@institute.com",
        },
        {
            id: "3",
            image: require("../../src/assets/images/image.png"),
            name: "Mr. John Smith",
            phone: "+1 555 123 456",
            email: "manager@institute.com",
        },
    ];

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
                    onPress={() => openImageViewer(require("../../src/assets/images/avatar.png"))}
                >
                    <Image
                        source={require("../../src/assets/images/avatar.png")}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>

                {/* User Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.nameText}>{"Mr. Frank Chair Man"}</Text>
                    <Text style={styles.emailText}>{"CEO of institute"}</Text>
                </View>

                {/* Message Section */}
                <View style={styles.message}>
                    <Text style={styles.messageText}>
                        Our goal is to create impactful digital experiences that make life easier and businesses more efficient. We are committed to excellence, innovation, and building trust with every solution we deliver. Thank you for believing in our mission.
                    </Text>
                </View>

                <Text style={styles.assistantText}>{"Executive Assistant"}</Text>

                {/* Horizontal Scroll Section */}
                <FlatList
                    horizontal
                    data={horizontalData}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ marginHorizontal: 16, paddingVertical: 8 }}
                    renderItem={({ item }) => (
                        <HorizontalProfileCard item={item} onPress={() => openImageViewer(item.image)} />
                    )}
                />
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
    },
    assistantText: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        lineHeight: 26,
        color: colors.text,
        margin: 16,
    },

    horizontalCard: {
        marginRight: 16,
        width: 269,
        height: "70%",
        borderRadius: 20,
        overflow: "hidden",
    },
    horizontalImage: { width: "100%", height: "100%", resizeMode: "cover" },

    overlay: {
        position: "absolute",
        bottom: 0,
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
});
