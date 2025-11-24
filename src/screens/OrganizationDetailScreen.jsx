import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HeaderWithActions from "../components/HeaderWithActions";

// Theme handling
const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const OrganizationDetailScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={[styles.container]}>
            {/* Header */}
            <HeaderWithActions onBackPress={() => navigation.goBack()} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
                Organization Detail
            </Text>

            {/* Content */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <Section title="Overview">
                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        Malaysia-Myanmar Business Chamber (MMBC) was established in July 2011.{"\n"}
                        Patronage: Embassy of Malaysia.{"\n"}
                        Registration: Legal entity with the Department of Investment and Company Administration (DICA).{"\n"}
                        Recognition: Officially recognized by the Union of Myanmar Federation of Chambers of Commerce and Industry (UMFCCI).
                    </Text>
                </Section>

                <Section title="Objective">
                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        MMBC aims to enhance and facilitate Malaysian businesses in Myanmar and the surrounding regions. 
                        As a non-governmental, non-political, and non-profit organization, it serves as a platform for fostering bilateral business opportunities.
                    </Text>
                </Section>

                <Section title="Governance">
                    <Bullet>Executive Committee: Elected with 12 members</Bullet>
                    <Bullet>Patron: Ambassador of Malaysia to Myanmar</Bullet>
                </Section>

                <Section title="Activities">
                    <Text style={[styles.paragraph, { color: colors.text }]}>Regular Events:</Text>
                    <Bullet>Networking sessions</Bullet>
                    <Bullet>Seminars and briefings</Bullet>
                    <Bullet>Information-sharing meetings</Bullet>
                    <Bullet>
                        Collaboration: Engages with other business chambers in Yangon (e.g., MHKCCI, SAM, TBAM, AIM, AMCHAM, British Chamber) to facilitate networking and idea exchange
                    </Bullet>
                </Section>

                <Section title="Membership Type">
                    <Bullet>Corporate Members</Bullet>
                    <Bullet>Small and Medium Enterprises (SMEs)</Bullet>
                    <Bullet>Individual Members</Bullet>
                </Section>

                <Section title="Initiatives">
                    <Bullet>Monthly visits to member companies</Bullet>
                    <Bullet>Hosting visits by Malaysian companies</Bullet>
                    <Bullet>Organizing webinars, trade fairs, and exhibitions</Bullet>
                    <Bullet>Coordinating trade delegations to Malaysia</Bullet>
                </Section>
            </ScrollView>
        </SafeAreaView>
    );
};

// Reusable Bullet component
const Bullet = ({ children }) => (
    <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 4 }}>
        <Text style={{ fontSize: 16, lineHeight: 24, marginRight: 6 }}>•</Text>
        <Text style={{ flex: 1, fontSize: 16, lineHeight: 24, color: colors.text }}>{children}</Text>
    </View>
);

// Reusable Section component
const Section = ({ title, children }) => (
    <View style={{ marginBottom: 16 }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {children}
    </View>
);

export default OrganizationDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor:'#fff'
    },
    headerTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 16,
    },
    content: {
        flex: 1,
        paddingVertical: 8,
    },
    sectionTitle: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 18,
        marginBottom: 8,
    },
    paragraph: {
        fontFamily: FontFamily.Regular,
        fontSize: 16,
        lineHeight: 24,
    },
});
