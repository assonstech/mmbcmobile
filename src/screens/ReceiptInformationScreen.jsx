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
        isPaid,
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
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <View style={styles.receiptTitleBlock}>
                            <Text style={styles.receiptLabel}>Receipt no.</Text>
                            <Text style={styles.receiptNumber}>
                                #{registrationId || eventId || "-"}
                            </Text>
                        </View>

                        <View style={styles.statusPill}>
                            <Text style={styles.statusText}>
                                {isPaid ? "Paid" : "Pending"}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.summaryTitle} numberOfLines={2}>
                        {eventTitle || "Event payment"}
                    </Text>

                    <View style={styles.dateRow}>
                        <Image source={CalendarIcon} style={styles.dateIcon} />
                        <Text style={styles.dateText}>{formatDate(eventDate)}</Text>
                    </View>
                </View>

                <View style={styles.receiptCard}>
                    <ReceiptItem
                        label="Received from"
                        value={companyName || "-"}
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
                </View>

                <View style={styles.totalCard}>
                    <Text style={styles.amountLabel}>Total amount</Text>
                    <Text style={styles.amountValue}>
                        {eventFee ? `${formattedPrice(eventFee)} MMK` : "Free"}
                    </Text>
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
    container: { flex: 1, backgroundColor: "#F6F7F9" },

    headerWrapper: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 48,
    },
    summaryCard: {
        backgroundColor: "white",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 16,
        marginBottom: 14,
    },
    summaryHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    receiptTitleBlock: {
        flex: 1,
        paddingRight: 12,
    },
    receiptLabel: {
        fontFamily: FontFamily.Medium,
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 4,
    },
    receiptNumber: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        color: "#111827",
        fontWeight: "700",
    },
    statusPill: {
        minHeight: 32,
        borderRadius: 9999,
        backgroundColor: "#EEF2F7",
        justifyContent: "center",
        paddingHorizontal: 14,
    },
    statusText: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 13,
        color: "#374151",
        fontWeight: "600",
    },
    dateRow: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#EEF0F3",
        flexDirection: "row",
        alignItems: "center",
    },
    dateIcon: {
        width: 17,
        height: 17,
        resizeMode: "contain",
        tintColor: "#374151",
        marginRight: 7,
    },
    dateText: {
        fontFamily: FontFamily.Medium,
        fontSize: 13,
        color: "#374151",
    },
    summaryTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        lineHeight: 26,
        fontWeight: "700",
        color: "#111827",
    },

    receiptCard: {
        backgroundColor: "white",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginBottom: 14,
    },

    itemContainer: {
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: "#EEF0F3",
    },

    itemLabel: {
        fontFamily: FontFamily.Medium,
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 6,
        fontWeight: "500",
    },

    itemValue: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 16,
        color: "#111827",
        fontWeight: "600",
        lineHeight: 23,
    },
    totalCard: {
        backgroundColor: "#111827",
        borderRadius: 14,
        padding: 18,
    },
    amountLabel: {
        fontFamily: FontFamily.Medium,
        fontSize: 13,
        color: "#D1D5DB",
        marginBottom: 6,
    },
    amountValue: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 22,
        fontWeight: "700",
        color: "white",
    },
});
