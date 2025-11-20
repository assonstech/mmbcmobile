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
import { fetchNote } from "../controllers/NoteController";
import { getFullImageUrl } from "../common/HttpSerivce";

const ITEM_WIDTH = 150; // ↑ increased to fix blur
const SCREEN_WIDTH = Dimensions.get("window").width;

const OrganizationChart = ({ navigation }) => {
  const [members, setMembers] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState([0]);
  const [loading, setLoading] = useState(false);

  const getAllEcMembers = async () => {
    try {
      setLoading(true);

      const [ecResponse, secretariesResponse] = await Promise.all([
        getECMembers(),
        fetchNote(),
      ]);

      let transformedMembers = ecResponse.data.map((member) => ({
        memberId: member.memberId.toString(),
        name: member.representiveName,
        position: member.ecPosition || "CEO",
        parentMemberId: member.parentMemberId
          ? member.parentMemberId.toString()
          : null,
        isCEO: member.isCEO,
        avatar: getFullImageUrl(member.companyOrIndividualImage),
      }));

      const ceoId = secretariesResponse.memberId.toString();
      const lastMemberId = Math.max(
        ...transformedMembers.map((m) => parseInt(m.memberId))
      );

      secretariesResponse.Secretaries.forEach((sec, index) => {
        transformedMembers.push({
          memberId: (lastMemberId + index + 1).toString(),
          name: sec.name,
          position: "Secretariat",
          parentMemberId: ceoId,
          isCEO: false,
          avatar: getFullImageUrl(sec.photoPath),
        });
      });

      setMembers(transformedMembers);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllEcMembers();
  }, []);

  const scrollXRefs = useRef([]);
  const flatListRefs = useRef([]);

  const rows = useMemo(() => {
    const ceo = members.find((m) => m.isCEO);
    if (!ceo) return [];

    const rowsArray = [];
    let currentParentIds = [ceo.memberId];
    rowsArray.push([ceo]);

    for (let level = 0; level < 10; level++) {
      const nextRow = members.filter((m) =>
        currentParentIds.includes(m.parentMemberId)
      );
      if (nextRow.length === 0) break;

      rowsArray.push(nextRow);

      const rowIndex = rowsArray.length - 1;
      const selectedMember =
        nextRow[selectedIndexes[rowIndex] || 0] || nextRow[0];
      currentParentIds = selectedMember ? [selectedMember.memberId] : [];
    }

    return rowsArray;
  }, [members, selectedIndexes]);

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

    const newSelectedIndexes = [...selectedIndexes];
    newSelectedIndexes[rowIndex] = index;

    setSelectedIndexes(newSelectedIndexes);

    // Reset child rows
    for (let i = rowIndex + 1; i < rows.length; i++) {
      newSelectedIndexes[i] = 0;
      if (scrollXRefs.current[i]) scrollXRefs.current[i].setValue(0);
      const list = flatListRefs.current[i];
      if (list) {
        setTimeout(
          () => list.scrollToOffset({ offset: 0, animated: true }),
          100 * (i - rowIndex)
        );
      }
    }
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
          if (!scrollXRefs.current[rowIndex])
            scrollXRefs.current[rowIndex] = new Animated.Value(0);

          const selectedMember =
            row[selectedIndexes[rowIndex] || 0] || row[0];

          return (
            <View key={rowIndex} style={styles.rowContainer}>
              {rowIndex !== 0 && <View style={styles.dividerLine} />}

              <Animated.FlatList
                ref={(ref) => (flatListRefs.current[rowIndex] = ref)}
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
                    : 0;

                  // 👉 replaced scale with opacity (fix blur)
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
  rowContainer: { alignItems: "center" },
  headerTitle: {
    fontFamily: FontFamily.SemiBold,
    paddingTop: 10,
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  dividerLine: {
    width: "100%",
    height: 1.5,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },

  // SHARP RETINA AVATAR
  avatar: {
    width: Platform.OS === 'ios' ? 120 : 110,
    height: Platform.OS === 'ios' ? 120 : 110,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "#fff",
    resizeMode: "stretch",
  },

  itemText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: FontFamily.SemiBold,
    textAlign: "center",
    marginTop: 8,
  },
  positionText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: FontFamily.Medium,
    textAlign: "center",
  },
  fixedTextContainer: {
    alignItems: "center",
    marginTop: 8,
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
