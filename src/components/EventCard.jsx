import React, { memo, useState } from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { FontFamily } from "../styles/fontStyle";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";

const { width } = Dimensions.get("window");
const isDardMode = true
const colors = isDardMode ? DarkColors : LightColors

const EventCard = ({ item, onPress }) => {
    const [loading, setLoading] = useState(true);
    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Top Image Section */}
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
                <Image source={item.image} style={styles.cardImage} onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)} />

                {/* Rule & Price Top-Right */}
                <View style={styles.topRight}>
                    <Text style={styles.priceText}>{item.price} MMK</Text>
                </View>

                {/* Description & Location Bottom-Left */}
                <View style={styles.bottomLeft}>
                    <Text style={styles.descriptionText} numberOfLines={2}>
                        {item.description}
                    </Text>
                    <Text style={styles.locationText}>{item.location}</Text>
                </View>
            </View>

            {/* Bottom Section: Date & Time */}
            <View style={styles.bottomRow}>
                <View style={{ flexDirection: 'row', gap: 2 }}>
                    <Image source={require('../assets/icons/calendar.png')} style={{ width: 24, height: 24 }} />
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 2 }}>
                    <Image source={require('../assets/icons/endo-clock.png')} style={{ width: 24, height: 24 }} />
                    <Text style={styles.timeText}>{item.time}</Text>

                </View>

            </View>
            <View style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, flex: 1, backgroundColor: colors.primary, margin: 2 }}>
                <Text style={styles.ruleText}>{item.rule}</Text>
            </View>

        </TouchableOpacity>
    )
}

export default memo(EventCard);

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: colors.background,
        elevation: 3,
    },
    imageContainer: {
        paddingVertical: 4,
        paddingHorizontal: 4,
        width: "100%",
        height: 220,
        position: "relative",
    },
    cardImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 20,
    },
    topRight: {
        position: "absolute",
        top: 8,
        right: 8,
        alignItems: "flex-end",
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 9999,
        paddingHorizontal: 16,
        paddingVertical: 8

    },
    ruleText: {
        color: "#fff",
        fontFamily: FontFamily.Medium,
        fontSize: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        textAlign: 'center'
    },
    priceText: {
        color: "#fff",
        fontFamily: FontFamily.SemiBold,
        fontSize: 14,
    },
    bottomLeft: {
        position: "absolute",
        bottom: 8,
        left: 8,
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
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: 80,
        padding: 16,
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
});
