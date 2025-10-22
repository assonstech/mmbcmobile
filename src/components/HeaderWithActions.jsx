import React, { memo } from "react";
import { View, TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const HeaderWithActions = ({
  title = "",          // ✅ new optional title prop
  onBackPress,
  onNextPress,
  showNext = false,
  nextDisabled = false,
}) => {
  return (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity onPress={onBackPress} activeOpacity={0.7}>
        <View style={styles.circle}>
          <Image
            source={require("../../src/assets/icons/arrowleft.png")}
            style={styles.backIcon}
          />
        </View>
      </TouchableOpacity>

      {/* ✅ Center Title */}
      {title ? (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }} /> // keeps layout balanced if no title
      )}

      {/* Next Button */}
      {showNext ? (
        <TouchableOpacity
          onPress={onNextPress}
          activeOpacity={0.7}
          disabled={nextDisabled}
          style={[
            styles.button,
            {
              backgroundColor: nextDisabled
                ? colors.itemSeparateColor
                : colors.button,
            },
          ]}
        >
          <Text
            style={[
              styles.nextText,
              { color: nextDisabled ? colors.loginAccountColor : colors.text },
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 44 }} /> // keeps space if Next button is hidden
      )}
    </View>
  );
};

export default memo(HeaderWithActions);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  circle: {
    padding: 12,
    borderRadius: 9999,
    backgroundColor: colors.itemSeparateColor,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
    minHeight: 44,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    tintColor: "#000",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  titleText: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 18,
    color: colors.text,
    textAlign: "center",
  },
  nextText: {
    fontFamily: FontFamily.Medium,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 9999,
  },
});
