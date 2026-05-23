// KnowledgeCard.js
import React, { memo, useState } from "react";
import { ActivityIndicator, View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { FontFamily } from "../styles/fontStyle";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import ImageViewing from "react-native-image-viewing";
import { getFullImageUrl } from "../common/HttpSerivce";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const KnowledgeCard = ({ item, index, onToggleExpand, onViewFile }) => {
  const [expanded, setExpanded] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const initial = item?.name ? item.name.charAt(0).toUpperCase() : "?";

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    onToggleExpand?.(item.id, next, index); // ✅ pass index too
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {item.profileImage ? (
          <Image source={item.profileImage} style={styles.profileImage} />
        ) : (
          <View style={styles.fallbackAvatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}

        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.timeAgo}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={expanded ? undefined : 3}>
        {item.description}
      </Text>

      {item?.description?.length > 120 && (
        <TouchableOpacity onPress={toggleExpand}>
          <Text style={styles.seeMore}>{expanded ? "See less" : "See more"}</Text>
        </TouchableOpacity>
      )}

      {item.image && (
        <TouchableOpacity style={styles.postImageWrapper} onPress={() => setImageVisible(true)}>
          {imageLoading && (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={styles.imageLoader}
            />
          )}
          <Image
            source={item.image}
            style={styles.postImage}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />
        </TouchableOpacity>
      )}

      {item.image && (
        <ImageViewing
          images={[{ uri: item.image.uri }]}
          imageIndex={0}
          visible={imageVisible}
          onRequestClose={() => setImageVisible(false)}
        />
      )}

      {!!item.pdfUrl && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.viewFileButton}
          onPress={() => onViewFile?.(getFullImageUrl(item.pdfUrl))}
        >
          <Text style={styles.viewFileText}>View File</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default memo(KnowledgeCard);

// styles same as yours...
const styles = StyleSheet.create({
  card: { padding: 12, marginHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  profileImage: { width: 40, height: 40, borderRadius: 21, marginRight: 10 },
  fallbackAvatar: {
    width: 40, height: 40, borderRadius: 21, marginRight: 10,
    backgroundColor: "#CBD5E1", justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontFamily: FontFamily.SemiBold, fontSize: 18, color: "#1E293B" },
  name: { fontFamily: FontFamily.SemiBold, fontSize: 14, color: colors.text, fontWeight: "600", lineHeight: 20 },
  time: { fontFamily: FontFamily.Medium, fontSize: 12, color: colors.loginAccountColor, lineHeight: 18, fontWeight: "500" },
  description: { fontFamily: FontFamily.Regular, fontSize: 16, color: colors.text, lineHeight: 24, fontWeight: "400" },
  seeMore: { fontFamily: FontFamily.SemiBold, fontSize: 16, color: colors.signUpTextColor, lineHeight: 24, marginTop: 4 },
  postImageWrapper: {
    width: "100%",
    height: 203,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
    backgroundColor: colors.itemSeparateColor,
  },
  postImage: { width: "100%", height: "100%", resizeMode: "cover" },
  imageLoader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    zIndex: 1,
  },
  viewFileButton: {
    alignSelf: "flex-start",
    backgroundColor: "#5A1E08",
    borderRadius: 9999,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 12,
  },
  viewFileText: {
    fontFamily: FontFamily.Medium,
    fontSize: 13,
    color: "white",
  },
});
