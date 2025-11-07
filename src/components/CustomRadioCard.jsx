import React, { memo } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Image } from "react-native";
import iconSelected from "../assets/icons/selectedradio.png";
import iconUnselected from "../assets/icons/unselectedradio.png";
import { FontFamily } from "../styles/fontStyle";

const CustomRadioCard = ({
    title,
    body,
    selected,
    onPress,
    colors,         // color theme
}) => {
    return (
        <TouchableOpacity
            style={[styles.card, selected && { borderColor: colors.button, borderWidth: 2 }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Radio Icon */}
            <Image
                source={selected ? iconSelected : iconUnselected}
                style={styles.radioIcon}
            />

            {/* Text Content */}
            <Text style={[styles.title, { color: colors.loginAccountColor }]}>Register For <Text style={{ color: colors.text }}>{title}</Text></Text>
            <Text style={[styles.body, { color: colors.loginAccountColor }]}>{body}</Text>
        </TouchableOpacity>
    );
};

export default memo(CustomRadioCard);

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        backgroundColor: "#fff",
        gap: 8,
        paddingLeft: 10,
    },
    radioIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
        resizeMode: "contain",
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        fontWeight: "600",
        lineHeight: 26,
    },
    body: {
        fontFamily: FontFamily.Regular,
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 26,
    },
});
