import React, { memo, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { FontFamily } from "../styles/fontStyle";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import ImageViewing from "react-native-image-viewing";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const KnowledgeCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const [imageVisible, setImageVisible] = useState(false); // <-- state for modal
  const initial = item?.name ? item.name.charAt(0).toUpperCase() : "?";

  const toggleExpand = () => setExpanded(!expanded);

  return (
    <View style={styles.card}>
      {/* Header */}
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

      {/* Description */}
      <Text
        style={styles.description}
        numberOfLines={expanded ? undefined : 3}
      >
        {item.description}
      </Text>

      {item?.description.length > 120 && (
        <TouchableOpacity onPress={toggleExpand}>
          <Text style={styles.seeMore}>
            {expanded ? "See less" : "See more"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Post Image */}
      {item.image && (
        <TouchableOpacity onPress={() => setImageVisible(true)}>
          <Image source={item.image} style={styles.postImage} />
        </TouchableOpacity>
      )}

      {/* Image Fullscreen Modal */}
      {item.image && (
        <ImageViewing
          images={[{ uri: item.image.uri }]}
          imageIndex={0}
          visible={imageVisible}
          onRequestClose={() => setImageVisible(false)}
        />
      )}
    </View>
  );
};

export default memo(KnowledgeCard);

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 21,
    marginRight: 10,
  },
  fallbackAvatar: {
    width: 40,
    height: 40,
    borderRadius: 21,
    marginRight: 10,
    backgroundColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 18,
    color: "#1E293B",
  },
  name: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 14,
    color: colors.text,
    fontWeight:'600',
    lineHeight:20
  },
  time: {
    fontFamily: FontFamily.Medium,
    fontSize: 12,
    color: colors.loginAccountColor,
    lineHeight:18,
    fontWeight:'500'
  },
  description: {
    fontFamily: FontFamily.Regular,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontWeight:'400'
  },
  seeMore: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 16,
    color: colors.signUpTextColor, 
    lineHeight:24,
    marginTop: 4,
  },
  postImage: {
    width: "100%",
    height: 203,
    borderRadius: 10,
    resizeMode: "cover",
    marginTop: 10,
  },
});
