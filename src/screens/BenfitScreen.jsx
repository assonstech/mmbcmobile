import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HeaderWithActions from "../components/HeaderWithActions";
import ImageViewing from "react-native-image-viewing";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const BenefitScreen = () => {
    const navigation = useNavigation();

    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(0);

    // Convert local require() image to { uri } for ImageViewing
    const toImageViewerSource = (img) => ({ uri: Image.resolveAssetSource(img).uri });

    const openImageViewer = (imagesArray, index) => {
        const viewerArray = imagesArray.map(toImageViewerSource);
        setViewerImages(viewerArray);
        setViewerIndex(index);
        setIsImageViewerVisible(true);
    };

    const affiliationImages = [
        require("../assets/images/5.jpg"),
        require("../assets/images/4.jpg"),
        require("../assets/images/2.jpg"),
        require("../assets/images/3.jpg"),
    ];

    return (
        <SafeAreaView style={styles.container}>
            <HeaderWithActions onBackPress={() => navigation.goBack()} />

            <Text style={styles.headerTitle}>Member Benefits & Affiliation Programs</Text>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Benefit Section - One Image */}
                <Text style={styles.sectionTitle}>Benefits</Text>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => openImageViewer([require("../assets/images/1.png")], 0)}
                >
                    <Image
                        source={require("../assets/images/1.png")}
                        style={styles.benefitImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                {/* Affiliation Section - 4 Images */}
                <Text style={styles.sectionTitle}>Affiliation Programs</Text>

                {affiliationImages.map((img, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        onPress={() => openImageViewer(affiliationImages, index)}
                    >
                        <View style={styles.card}>
                            <Image
                                source={img}
                                style={styles.cardImage}
                                resizeMode="cover"
                            />
                        </View>
                    </TouchableOpacity>
                ))}

            </ScrollView>

            {/* Fullscreen Image Viewer with horizontal swipe */}
            <ImageViewing
                images={viewerImages}
                imageIndex={viewerIndex}
                visible={isImageViewerVisible}
                onRequestClose={() => setIsImageViewerVisible(false)}
            />
        </SafeAreaView>
    );
};

export default BenefitScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 16,
    },
    headerTitle: {
        fontFamily: FontFamily.SemiBold,
        paddingTop: 32,
        fontSize: 24,
        fontWeight: "600",
        color: "#000",
    },
    content: {
        flex: 1,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: FontFamily.SemiBold,
        marginVertical: 12,
        color: "#000",
    },

    /* ---- Card Style ---- */
    card: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 20,
        overflow: "hidden",
        borderWidth: 0.5,
        borderColor: colors.loginAccountColor
    },
    cardImage: {
        width: "100%",
        height: 300,
    },
    benefitImage: {
        width: "100%",
        height: 500,    // Benefit image fills the card
    },

});
