import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HeaderWithActions from "../components/HeaderWithActions";
import { FontFamily } from "../styles/fontStyle";
import { formattedPrice } from "../common/HttpSerivce";
import CalendarIcon from "../assets/icons/endo-calendar.png";

const ReceiptInformationScreen = ({ navigation, route }) => {
    const {
        registrationId,
        eventId,
        eventTitle,
        eventLocation,
        eventFee,
        eventDate,
        companyName,
        paymentType,
    } = route?.params || {};

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerWrapper}>
                <HeaderWithActions
                    title="Receipt information"
                    onBackPress={() => navigation.goBack()}
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topRow}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoTopRow}>
                            <Text style={styles.infoLabel}>Serial No.</Text>
                            <Text style={styles.hashText}>#</Text>
                        </View>

                        <Text style={styles.infoValue}>
                            {registrationId || "-"}
                        </Text>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoTopRow}>
                            <Text style={styles.infoLabel}>Date</Text>

                            <Image
                                source={CalendarIcon}
                                style={styles.topCardIcon}
                            />
                        </View>

                        <Text style={styles.infoValue}>
                            {formatDate(eventDate)}
                        </Text>
                    </View>
                </View>

                <View style={styles.receiptCard}>
                    <ReceiptItem
                        label="Received from"
                        value={companyName || "-"}
                    />

                    <ReceiptItem
                        label="Amount in words"
                        value="-"
                    />

                    <ReceiptItem
                        label="For the payment of"
                        value={eventTitle || "-"}
                    />

                    <ReceiptItem
                        label="Event Location"
                        value={eventLocation || "-"}
                    />

                    <ReceiptItem
                        label="Paid by"
                        value={paymentType || "Cash"}
                    />

                    <ReceiptItem
                        label="Amount"
                        value={
                            eventFee
                                ? `${formattedPrice(eventFee)} MMK`
                                : "Free"
                        }
                    />

                    <View style={{ marginTop: 8 }}>
                        <Text style={styles.itemLabel}>Received by</Text>

                        <Text style={styles.signature}>𝓓</Text>
                    </View>

                    <View style={styles.qrContainer}>
                        <Image
                            source={{
                                uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MMBC-Receipt-${registrationId || eventId}`,
                            }}
                            style={styles.qrImage}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const ReceiptItem = ({ label, value }) => {
    return (
        <View style={styles.itemContainer}>
            <Text style={styles.itemLabel}>{label}</Text>
            <Text style={styles.itemValue}>{value}</Text>
        </View>
    );
};

export default ReceiptInformationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFDF5",
    },

    headerWrapper: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    scrollContent: {
        paddingHorizontal: 18,
        paddingBottom: 40,
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    infoCard: {
        width: "48%",
        backgroundColor: "#F7DFC4",
        borderRadius: 24,
        padding: 18,
    },

    infoTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    infoLabel: {
        fontFamily: FontFamily.Medium,
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },

    hashText: {
        fontSize: 24,
        fontWeight: "700",
        color: "#7C2D12",
    },

    topCardIcon: {
        width: 22,
        height: 22,
        resizeMode: "contain",
        tintColor: "#7C2D12",
    },

    infoValue: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        fontWeight: "700",
        color: "#4A1D0C",
    },

    receiptCard: {
        backgroundColor: "#F9EAEA",
        borderRadius: 34,
        padding: 24,
    },

    itemContainer: {
        marginBottom: 28,
    },

    itemLabel: {
        fontFamily: FontFamily.Medium,
        fontSize: 15,
        color: "#6B7280",
        marginBottom: 10,
        fontWeight: "500",
    },

    itemValue: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        color: "#2B0D0D",
        fontWeight: "700",
        lineHeight: 30,
    },

    signature: {
        fontSize: 90,
        color: "#2B0D0D",
        marginTop: -10,
        marginBottom: -10,
    },

    qrContainer: {
        alignItems: "center",
        marginTop: 12,
    },

    qrImage: {
        width: 130,
        height: 130,
        borderRadius: 12,
    },
});
