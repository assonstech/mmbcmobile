import React, { memo, useState } from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { FontFamily } from "../styles/fontStyle";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { formattedPrice } from "../common/HttpSerivce";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const EventCard = ({ item, onPress }) => {
    const [loading, setLoading] = useState(false);

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                {loading && (
                    <ActivityIndicator
                        size="large"
                        color="#0000ff"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: [{ translateX: -12 }, { translateY: -12 }],
                            zIndex: 1,
                        }}
                    />
                )}

                {item.image && (
                    <Image
                        source={item.image}  // Keep your original { uri: ... } object
                        style={styles.cardImage}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                    />
                )}

                {/* Price Top-Right */}
                <View style={styles.topRight}>
                    <Text style={styles.priceText}>{formattedPrice(item.price)} MMK</Text>
                </View>

                {/* Description & Location Bottom-Left */}
                <View style={styles.bottomLeft}>
                    <Text style={styles.descriptionText} numberOfLines={2}>
                        {item.description}
                    </Text>
                    <Text style={styles.locationText}>{item.location}</Text>
                </View>
            </View>

            {/* Bottom Row */}
            <View style={styles.bottomRow}>
                <View style={{ flexDirection: 'row', gap: 4, alignItems: "center" }}>
                    <Image source={require('../assets/icons/endo-calendar.png')} style={{ width: 24, height: 24, tintColor: 'white' }} />
                    <Text style={styles.dateText}>{item?.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 4, alignItems: "center" }}>
                    <Image source={require('../assets/icons/endo-clock.png')} style={{ width: 24, height: 24, tintColor: 'white' }} />
                    <Text style={styles.timeText}>{item.time}</Text>
                </View>
            </View>

            {/* Rule Section */}
            <View style={styles.ruleContainer}>
                <Text style={styles.ruleText}>{item.rule}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default memo(EventCard);

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: colors.background,
        elevation: 3,
        marginBottom: 16,
    },
    imageContainer: {
        width: "100%",
        height: 220,
        position: "relative",
        padding: 4,
    },
    cardImage: {
        width: "100%",
        height: "100%",
        borderRadius: 20,
        resizeMode: "cover",
    },
    topRight: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 9999,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    priceText: {
        color: colors.text,
        fontFamily: FontFamily.SemiBold,
        fontSize: 14,
    },
    bottomLeft: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent overlay
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    descriptionText: {
        color: "#fff",
        fontFamily: FontFamily.SemiBold,
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
    },
    locationText: {
        color: "#fff",
        fontFamily: FontFamily.Medium,
        fontWeight: '500',
        lineHeight: 20,
        fontSize: 14,
        marginTop: 4,
    },

    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: 80,
        paddingHorizontal: 16,
    },
    dateText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        color: "#fff",
    },
    timeText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        color: "#fff",
    },
    ruleContainer: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        flex: 1,
        backgroundColor: colors.primary,
        margin: 2,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
    },
    ruleText: {
        color: "#fff",
        fontFamily: FontFamily.Medium,
        fontSize: 12,
        textAlign: 'center',
    },
});
