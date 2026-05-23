import React, { memo, useState } from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { FontFamily } from "../styles/fontStyle";
import { formattedPrice } from "../common/HttpSerivce";
import CalendarIcon from "../assets/icons/endo-calendar.png";
import ClockIcon from "../assets/icons/endo-clock.png";
import MemberPriceIcon from "../assets/icons/memberPrice.png";
import NonMemberPriceIcon from "../assets/icons/nonMemberPrice.png";

const formatEventPrice = (price) => (
    price ? `${formattedPrice(price)} MMK` : "Free"
);

const EventCard = ({ item, onPress }) => {
    const [loading, setLoading] = useState(false);

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                {loading && (
                    <ActivityIndicator
                        size="large"
                        color="#FDB813"
                        style={styles.imageLoader}
                    />
                )}

                {item.image && (
                    <Image
                        source={item.image}
                        style={styles.cardImage}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                    />
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.locationText} numberOfLines={1}>
                    {item.location}
                </Text>
                <Text style={styles.titleText} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={styles.metaRow}>
                    <Image source={CalendarIcon} style={styles.metaIcon} />
                    <Text style={styles.metaText}>{item.displayDate || item.date}</Text>
                </View>

                <View style={styles.metaRow}>
                    <Image source={ClockIcon} style={styles.metaIcon} />
                    <Text style={styles.metaText}>{item.time}</Text>
                </View>

                <PriceBox
                    label="Member pricing"
                    value={formatEventPrice(item.memberPrice ?? item.price)}
                    accent
                />

                {item.showNonMemberPrice && (
                    <PriceBox
                        label="Non-member pricing"
                        value={formatEventPrice(item.nonMemberPrice ?? 0)}
                    />
                )}

                {!!item.rule && (
                    <View style={styles.ruleContainer}>
                        <Text style={styles.ruleText} numberOfLines={1}>
                            {item.rule}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const PriceBox = ({ label, value, accent = false }) => (
    <View style={styles.priceBox}>
        <Image
            source={accent ? MemberPriceIcon : NonMemberPriceIcon}
            style={styles.priceIcon}
        />
        <View style={styles.priceTextWrap}>
            <Text style={styles.priceLabel}>{label}</Text>
            <Text style={styles.priceValue}>{value}</Text>
        </View>
    </View>
);

export default memo(EventCard);

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 26,
        overflow: "hidden",
        backgroundColor: "#0B1426",
        borderWidth: 5,
        borderColor: "#081126",
        elevation: 4,
        marginBottom: 16,
    },
    imageContainer: {
        width: "100%",
        height: 142,
        position: "relative",
        backgroundColor: "#162236",
    },
    cardImage: {
        width: "100%",
        height: "100%",
        borderTopLeftRadius: 21,
        borderTopRightRadius: 21,
        resizeMode: "cover",
    },
    imageLoader: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -12 }, { translateY: -12 }],
        zIndex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 0,
    },
    locationText: {
        color: "#CBD4E1",
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        lineHeight: 21,
        marginBottom: 6,
    },
    titleText: {
        color: "#FFFFFF",
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        fontWeight: "700",
        lineHeight: 25,
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    metaIcon: {
        width: 28,
        height: 28,
        resizeMode: "contain",
        tintColor: "#FFFFFF",
        marginRight: 14,
    },
    metaText: {
        fontFamily: FontFamily.Medium,
        fontSize: 17,
        lineHeight: 24,
        color: "#FFFFFF",
    },
    priceBox: {
        minHeight: 66,
        borderRadius: 8,
        backgroundColor: "#1C2A3E",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        marginBottom: 6,
        marginHorizontal: -16,
    },
    priceIcon: {
        width: 42,
        height: 42,
        resizeMode: "contain",
        marginRight: 18,
    },
    priceTextWrap: {
        flex: 1,
    },
    priceLabel: {
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        lineHeight: 20,
        color: "#CBD4E1",
    },
    priceValue: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 20,
        fontWeight: "700",
        lineHeight: 27,
        color: "#FFFFFF",
    },
    ruleContainer: {
        minHeight: 44,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 21,
        borderBottomRightRadius: 21,
        backgroundColor: "#1C2A3E",
        justifyContent: "center",
        paddingHorizontal: 20,
        marginTop: 2,
        marginHorizontal: -16,
    },
    ruleText: {
        color: "#CBD4E1",
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        lineHeight: 21,
    },
});
