import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import CalendarIcon from "../assets/icons/endo-calendar.png";
import NotificationIcon from "../assets/icons/notification.png";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const notifications = [
  {
    id: "1",
    section: "Today",
    title: "Notification title",
    body: "Lorem ipsum dolor sit amet consectetur. Amet at tristique lorem id quis placerat a ullamcorper.",
    time: "3:21 PM",
  },
  {
    id: "2",
    section: "Today",
    title: "Pearl Myeik (Myanmar) Co., ltd",
    body: "Lorem ipsum dolor sit amet consectetur. Amet at tristique lorem id quis placerat a ullamcorper.",
    time: "3:21 PM",
  },
  {
    id: "3",
    section: "Yesterday",
    title: "Pearl Myeik (Myanmar) Co., ltd",
    body: "Lorem ipsum dolor sit amet consectetur. Amet at tristique lorem id quis placerat a ullamcorper.",
    time: "3:21 PM",
  },
];

const NotificationRow = ({ item, isLastInSection }) => (
  <View style={[styles.row, isLastInSection && styles.rowLastInSection]}>
    <View style={styles.iconBox}>
      <Image
        source={NotificationIcon}
        style={styles.rowIcon}
        resizeMode="contain"
      />
    </View>
    <View style={styles.content}>
      <Text style={styles.rowTitle}>{item.title}</Text>
      <Text style={styles.rowBody}>{item.body}</Text>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  </View>
);

const NotificationScreen = () => {
  const [selectedTab, setSelectedTab] = useState("General");

  const renderItem = ({ item, index }) => {
    const previous = notifications[index - 1];
    const next = notifications[index + 1];
    const showSection = !previous || previous.section !== item.section;
    const isLastInSection = !next || next.section !== item.section;

    return (
      <>
        {showSection && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{item.section}</Text>
            <View style={styles.sectionDivider} />
          </View>
        )}
        <NotificationRow item={item} isLastInSection={isLastInSection} />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.dateButton}>
          <Image
            source={CalendarIcon}
            style={styles.dateIcon}
            resizeMode="contain"
          />
          <Text style={styles.dateText}>Date filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segmentedControl}>
        {["General", "Receipt info"].map((tab) => {
          const isSelected = selectedTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.85}
              style={[styles.segmentButton, isSelected && styles.segmentButtonSelected]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={styles.segmentText}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 28,
  },
  title: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  dateButton: {
    height: 44,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.textInputBorderColor,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  dateIcon: {
    width: 20,
    height: 20,
    tintColor: colors.text,
    marginRight: 8,
  },
  dateText: {
    fontFamily: FontFamily.Medium,
    fontSize: 14,
    color: colors.text,
  },
  segmentedControl: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  segmentButton: {
    flex: 1,
    height: 44,
    borderRadius: 9999,
    backgroundColor: "#F8E7E7",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonSelected: {
    backgroundColor: colors.button,
  },
  segmentText: {
    fontFamily: FontFamily.Medium,
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  listContent: {
    paddingBottom: 120,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.textInputBorderColor,
  },
  row: {
    flexDirection: "row",
    marginHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.textInputBorderColor,
  },
  rowLastInSection: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FFE2BF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowIcon: {
    width: 22,
    height: 22,
    tintColor: "#5A1E08",
  },
  content: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 20,
  },
  rowBody: {
    fontFamily: FontFamily.Regular,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginTop: 4,
  },
  timeText: {
    alignSelf: "flex-end",
    fontFamily: FontFamily.Medium,
    fontSize: 12,
    color: colors.loginAccountColor,
    marginTop: 8,
  },
});
