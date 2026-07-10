import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderWithActions from "../components/HeaderWithActions";
import { FontFamily } from "../styles/fontStyle";
import { getECMembers } from "../controllers/MemberController";
import { getFullImageUrl } from "../common/HttpSerivce";

const ITEM_WIDTH = 150;
const SCREEN_WIDTH = Dimensions.get("window").width;

const ORG_ROWS = ["PRESIDENT", "BOD", "EC"];

const getOrgChartRow = (member) => {
  const apiRow = String(member.orgChartRow || "").toUpperCase();
  const position = String(member.ecPosition || "").trim().toUpperCase();

  if (ORG_ROWS.includes(apiRow)) return apiRow;
  if (member.isCEO || position === "PRESIDENT") return "PRESIDENT";
  if (position === "EC") return "EC";

  return "BOD";
};

const getOrgChartSortOrder = (member) => {
  const apiSortOrder = Number(member.orgChartSortOrder);
  const position = String(member.ecPosition || "").trim().toUpperCase();

  if (!Number.isNaN(apiSortOrder) && apiSortOrder > 0) return apiSortOrder;
  if (member.isCEO || position === "PRESIDENT") return 1;
  if (position.includes("VICE PRESIDENT I")) return 2;
  if (position.includes("VICE PRESIDENT II")) return 3;
  if (position === "SECRETARY") return 4;
  if (position === "TREASURER") return 5;
  if (position === "EC") return 10;

  return 9999;
};

const OrganizationChart = ({ navigation }) => {
  const [members, setMembers] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState([0, 0, 0]);
  const [loading, setLoading] = useState(false);

  const scrollXRefs = useRef([]);
  const flatListRefs = useRef([]);

  const getAllEcMembers = async () => {
    try {
      setLoading(true);

      const ecResponse = await getECMembers();
      console.log("ecResponse", ecResponse);
      const apiMembers = Array.isArray(ecResponse?.data)
        ? ecResponse.data
        : Array.isArray(ecResponse)
          ? ecResponse
          : [];

      const transformedMembers = apiMembers.map((member) => ({
        memberId: String(member.memberId),
        name: member.representiveName || "Unnamed Member",
        position: member.ecPosition || "-",
        isCEO: Boolean(member.isCEO),
        orgChartRow: getOrgChartRow(member),
        orgChartSortOrder: getOrgChartSortOrder(member),
        avatar: getFullImageUrl(member.companyOrIndividualImage),
      }));

      setMembers(transformedMembers);
    } catch (err) {
      console.log("get EC members error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllEcMembers();
  }, []);

  const rows = useMemo(() => {
    return ORG_ROWS.map((rowName) =>
      members
        .filter((member) => member.orgChartRow === rowName)
        .sort((a, b) => {
          return (
            a.orgChartSortOrder - b.orgChartSortOrder ||
            Number(a.memberId) - Number(b.memberId)
          );
        })
    ).filter((row) => row.length > 0);
  }, [members]);

  const getRowTitle = (rowIndex) => {
    const firstMember = rows[rowIndex]?.[0];
    const rowName = firstMember?.orgChartRow;

    if (rowName === "PRESIDENT") return "President";
    if (rowName === "BOD") return "Board of Directors";
    if (rowName === "EC") return "Executive Committee";

    return "";
  };

  const handleScroll = (rowIndex) =>
    Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: { x: scrollXRefs.current[rowIndex] },
          },
        },
      ],
      { useNativeDriver: false }
    );

  const handleScrollEnd = (rowIndex) => (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);

    setSelectedIndexes((prev) => {
      const next = [...prev];
      next[rowIndex] = index;
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginHorizontal: 16 }}>
        <HeaderWithActions
          onBackPress={() => navigation.goBack()}
          showNext={false}
        />
        <Text style={styles.headerTitle}>Organizational chart</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, marginTop: 10 }}
      >
        {rows.map((row, rowIndex) => {
          if (!scrollXRefs.current[rowIndex]) {
            scrollXRefs.current[rowIndex] = new Animated.Value(0);
          }

          const selectedMember =
            row[selectedIndexes[rowIndex] || 0] || row[0];

          return (
            <View key={rowIndex} style={styles.rowContainer}>
              {rowIndex !== 0 && <View style={styles.dividerLine} />}

              {/* <Text style={styles.rowTitle}>{getRowTitle(rowIndex)}</Text> */}

              <Animated.FlatList
                ref={(ref) => {
                  flatListRefs.current[rowIndex] = ref;
                }}
                data={row}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.memberId}
                contentContainerStyle={{
                  paddingHorizontal: (SCREEN_WIDTH - ITEM_WIDTH) / 2,
                }}
                onScroll={handleScroll(rowIndex)}
                onMomentumScrollEnd={handleScrollEnd(rowIndex)}
                snapToInterval={ITEM_WIDTH}
                decelerationRate="fast"
                scrollEventThrottle={16}
                renderItem={({ item, index }) => {
                  const scrollX = scrollXRefs.current[rowIndex];

                  const centerPosition = scrollX
                    ? Animated.subtract(index * ITEM_WIDTH, scrollX)
                    : new Animated.Value(0);

                  const opacity = centerPosition.interpolate({
                    inputRange: [-ITEM_WIDTH, 0, ITEM_WIDTH],
                    outputRange: [0.5, 1, 0.5],
                    extrapolate: "clamp",
                  });

                  return (
                    <Animated.View
                      style={{
                        width: ITEM_WIDTH,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Animated.Image
                        source={{ uri: item.avatar }}
                        style={[styles.avatar, { opacity }]}
                      />
                    </Animated.View>
                  );
                }}
              />

              <View style={styles.fixedTextContainer}>
                <Text style={styles.itemText} numberOfLines={1}>
                  {selectedMember.name}
                </Text>
                <Text
                  style={styles.positionText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {selectedMember.position}
                </Text>
              </View>
            </View>
          );
        })}

        {!loading && rows.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No organization members found</Text>
          </View>
        )}
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, backgroundColor: "#f9f9f9" },
  rowContainer: { alignItems: "center", marginBottom: 14 },
  headerTitle: {
    fontFamily: FontFamily.SemiBold,
    paddingTop: 10,
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  rowTitle: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 16,
    fontWeight: "600",
    color: "#102b61",
    marginBottom: 10,
  },
  dividerLine: {
    width: "100%",
    height: 1.5,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  avatar: {
    width: Platform.OS === "ios" ? 120 : 110,
    height: Platform.OS === "ios" ? 120 : 110,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "#fff",
    resizeMode: "cover",
    backgroundColor: "#e8e8e8",
  },
  itemText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: FontFamily.SemiBold,
    textAlign: "center",
    marginTop: 8,
    maxWidth: SCREEN_WIDTH - 48,
  },
  positionText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: FontFamily.Medium,
    textAlign: "center",
    color: "#666",
    maxWidth: SCREEN_WIDTH - 48,
  },
  fixedTextContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: FontFamily.Medium,
    fontSize: 14,
    color: "#777",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});

export default OrganizationChart;
