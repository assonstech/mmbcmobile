import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";

const isDarkMode = true
const colors = isDarkMode ? DarkColors : LightColors

const KnowledgeCardSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-200, 200], // shimmer movement
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={styles.name} />
          <View style={styles.time} />
        </View>
      </View>

      {/* Description */}
      <View style={styles.description} />

      {/* Post image */}
      <View style={styles.postImage} />

      {/* Shimmer overlay */}
      <Animated.View
        style={[
          styles.shimmerOverlay,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

export default KnowledgeCardSkeleton;

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: colors.itemSeparateColor, 
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  name: {
    width: 120,
    height: 14,
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: 'white',
  },
  time: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  description: {
    width: "100%",
    height: 60,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: -200,
    width: 200,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});
