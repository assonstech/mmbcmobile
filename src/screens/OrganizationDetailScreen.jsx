import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HeaderWithActions from "../components/HeaderWithActions";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const OrganizationDetailScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <HeaderWithActions
                onBackPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Organization Detail</Text>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.placeholderText}>
                    Malaysia-Myanmar Business Chamber (MMBC) was established in July 2011 under the patronage of the Embassy of Malaysia. It is a legal entity registered with the Department of Investment and Company Administration (DICA) and officially recognized by the Union of Myanmar Federation of Chambers of Commerce and Industry (UMFCCI). Its main objective is to be a platform to facilitate Malaysian businesses in Myanmar. It is governed by a duly elected Executive Committee (EC) with the Ambassador of Malaysia to Myanmar as Patron.{"\n\n"}
                    MMBC organises regular events such as briefings, seminars, networking and sharing of information with our members. We engage with other business chambers in Yangon to facilitate networking and ideas exchange in the business community. We also provide investment briefings in cooperation with the Economic Section of the Embassy of Malaysia as and when there are Malaysian delegates visiting Myanmar.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default OrganizationDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16
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
        paddingVertical: 16,
    },
    placeholderText: {
        fontFamily: FontFamily.Regular,
        fontWeight: '400',
        lineHeight: 24,
        fontSize: 16,
        color: colors.text,
    },
});
