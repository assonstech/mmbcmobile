import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import NotificationIcon from "../assets/icons/notification.png";
import {
  fetchGeneralNotifications,
  fetchPaymentNotifications,
} from "../controllers/NotificationController";
import { fetchEventDetail } from "../controllers/EventController";
import Screen from "../utils/Screen";
import { useUserType } from "../utils/useUserType";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;
const PAGE_LIMIT = 10;
const NOTIFICATION_TABS = {
  GENERAL: "GENERAL",
  PAYMENT: "PAYMENT",
};
const NON_MEMBER_BLOCKED_TYPES = ["NEWSLETTER", "SEASONALPROMOTION"];

const NotificationRow = ({ item, isLastInSection, loading, onPress }) => (
  <TouchableOpacity
    activeOpacity={item.canOpen ? 0.85 : 1}
    disabled={!item.canOpen || loading}
    style={[styles.row, isLastInSection && styles.rowLastInSection]}
    onPress={onPress}
  >
    <View style={styles.iconBox}>
      {loading ? (
        <ActivityIndicator size="small" color="#5A1E08" />
      ) : (
        <Image
          source={NotificationIcon}
          style={styles.rowIcon}
          resizeMode="contain"
        />
      )}
    </View>
    <View style={styles.content}>
      <Text style={styles.rowTitle} numberOfLines={2} ellipsizeMode="tail">
        {item.title}
      </Text>
      {!!item.description && (
        <Text style={styles.rowBody} numberOfLines={3} ellipsizeMode="tail">
          {item.description}
        </Text>
      )}
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  </TouchableOpacity>
);

const NotificationScreen = ({ navigation }) => {
  const { isNonMember } = useUserType();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState(NOTIFICATION_TABS.GENERAL);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openingNotificationId, setOpeningNotificationId] = useState(null);
  const listRef = useRef(null);
  const requestIdRef = useRef(0);

  const loadNotifications = useCallback(async (nextPage = 1, shouldAppend = false) => {
    const requestId = ++requestIdRef.current;

    if (shouldAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const fetchList = activeTab === NOTIFICATION_TABS.PAYMENT
      ? fetchPaymentNotifications
      : fetchGeneralNotifications;
    const result = await fetchList(nextPage, PAGE_LIMIT);

    if (requestId !== requestIdRef.current) return;

    const formatted = result.notifications
      .map(formatNotification)
      .filter((item) => (
        !isNonMember || !NON_MEMBER_BLOCKED_TYPES.includes(item.type)
      ));

    setNotifications((current) => (
      shouldAppend ? [...current, ...formatted] : formatted
    ));
    setPage(nextPage);
    setTotalPages(result.pagination?.totalPages || 1);
    setLoading(false);
    setLoadingMore(false);
  }, [activeTab, isNonMember]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications(1);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (loading || loadingMore || page >= totalPages) return;
    loadNotifications(page + 1, true);
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
  };

  const openPaymentReceipt = async (item) => {
    try {
      setOpeningNotificationId(item.id);
      const response = await fetchEventDetail(item.referenceId);
      const detail = response?.success ? response.data : null;
      const event = detail?.event;
      const registration = detail?.registration;

      if (!event || !registration) {
        Alert.alert(
          "Receipt unavailable",
          "Receipt information could not be found for this payment."
        );
        return;
      }

      navigation.navigate(Screen.ReceiptInformation, {
        registrationId: registration.registrationId,
        eventId: event.eventid,
        isPaid: registration.isPaid,
        eventTitle: event.eventTitle,
        eventLocation: event.eventLocation,
        eventFee: event.eventFee,
        eventDate: event.eventDate,
        companyName:
          registration.companyOrIndividualName ||
          "Malaysia Myanmar Business Chamber",
        paymentType: registration.paymentType || "Cash",
      });
    } catch (error) {
      console.log("Error loading receipt information:", error);
      Alert.alert(
        "Receipt unavailable",
        "Unable to load receipt information. Please try again."
      );
    } finally {
      setOpeningNotificationId(null);
    }
  };

  const openNotification = (item) => {
    if (!item.referenceId) return;

    if (item.isMemberOnly) {
      Alert.alert(
        "Member only",
        "This notification content is available for MMBC members only."
      );
      return;
    }

    switch (item.type) {
      case "EVENT":
        navigation.navigate(Screen.EventDetailScreen, {
          item: { id: String(item.referenceId) },
        });
        break;
      case "PAYMENT":
        openPaymentReceipt(item);
        break;
      case "NEWSLETTER":
        navigation.navigate(Screen.NewsletterDetail, {
          item: { newsletterId: item.referenceId },
        });
        break;
      case "SEASONALPROMOTION":
        navigation.navigate(Screen.SeasonalPromotionDetail, {
          item: { promotionId: item.referenceId },
        });
        break;
      case "KNOWLEDGE":
        navigation.navigate("Hub");
        break;
      default:
        break;
    }
  };

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
        <NotificationRow
          item={item}
          isLastInSection={isLastInSection}
          loading={openingNotificationId === item.id}
          onPress={() => openNotification(item)}
        />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.tabButton,
            activeTab === NOTIFICATION_TABS.GENERAL && styles.tabButtonActive,
          ]}
          onPress={() => handleTabPress(NOTIFICATION_TABS.GENERAL)}
        >
          <Text style={styles.tabText}>General</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.tabButton,
            activeTab === NOTIFICATION_TABS.PAYMENT && styles.tabButtonActive,
          ]}
          onPress={() => handleTabPress(NOTIFICATION_TABS.PAYMENT)}
        >
          <Text style={styles.tabText}>Payment info</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.button} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {activeTab === NOTIFICATION_TABS.PAYMENT
                ? "No payment notifications available."
                : "No notifications available."}
            </Text>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={colors.button}
                style={styles.footerLoader}
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const formatNotification = (item, isNonMember = false) => {
  const type = (item.type || "EVENT").toUpperCase();
  const referenceId = item.referenceId || item.eventId;
  const isMemberOnly = isNonMember && NON_MEMBER_BLOCKED_TYPES.includes(type);

  return {
    id: item.notificationId || item.id,
    title: item.title || "-",
    description: item.description || "",
    type,
    referenceId,
    isMemberOnly,
    canOpen: Boolean(referenceId),
    createdDate: item.createdDate,
    section: getDateSection(item.createdDate),
    time: formatTime(item.createdDate),
  };
};

const getDateSection = (dateValue) => {
  if (!dateValue) return "Earlier";

  const date = new Date(dateValue);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateValue) => {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginTop: 28,
    marginBottom: 16,
  },
  title: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  tabButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.itemSeparateColor,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: colors.button,
  },
  tabText: {
    fontFamily: FontFamily.Medium,
    fontSize: 14,
    color: colors.text,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyListContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    minWidth: 0,
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
  emptyText: {
    fontFamily: FontFamily.Medium,
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
  },
  footerLoader: {
    marginTop: 10,
    marginBottom: 18,
  },
});
