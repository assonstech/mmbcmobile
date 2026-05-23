import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from "react-native";
import EndoCalendar from "../assets/icons/Vector.png";
import EnfoProfile from "../assets/icons/endo-profile-circle.png";
import EndoCard from "../assets/icons/endo-personalcard.png";
import EndoGlobal from "../assets/icons/endo-global.png";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HttpSerivce, { getFullImageUrl } from "../common/HttpSerivce";
import QRCode from "react-native-qrcode-svg";
import AppLogo from "../assets/images/appLogo.png";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const FlipCard = ({ frontImage, backImage, height = 202, info, loading }) => {
  const [flipped, setFlipped] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const animatedValue = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;


  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  // 🔹 Flip animation
  const flipCard = () => {
    if (loading) return;
    Animated.timing(animatedValue, {
      toValue: flipped ? 0 : 180,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => setFlipped(!flipped));
  };

  // 🔹 Shimmer animation (vertical)

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading, shimmerAnim]);

  useEffect(() => {
    const loadToken = async () => {
      const token = await HttpSerivce.getAccessToken();
      setQrToken(token || "");
    };

    loadToken();
  }, []);

  const translateY = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-height / 2, height / 2],
  });

  // 🟩 Skeleton detail loading layout
  if (loading) {
    return (
      <View style={[styles.cardContainer, { height }]}>
        <View style={[styles.skeletonCard, { height }]}>
          {/* Profile Image Placeholder */}
          <View style={styles.skeletonProfileImage}>
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  transform: [{ translateY }],
                },
              ]}
            />
          </View>

          {/* Text Lines */}
          <View style={styles.skeletonOverlayContainer}>
            {[...Array(4)].map((_, index) => (
              <View key={index} style={styles.skeletonTextLine}>
                <Animated.View
                  style={[
                    styles.shimmerOverlay,
                    {
                      transform: [{ translateY }],
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // 🟩 Actual card when loaded
  const overlayItems = [
    { icon: EnfoProfile, text: info?.representiveName },
    { icon: EndoCard, text: info?.memberNRC },
    {
      icon: EndoCalendar,
      text: info?.endDate ? new Date(info.endDate)
        .toDateString()
        .split(" ")
        .slice(1)
        .join(" ") : " "
    },
    { icon: EndoGlobal, text: "Myanmar Centre Tower 2, 12th floor, Business suite, Kabar Aye Pagoda Rd, Yangon, Myanmar" },
  ];

  return (
    <TouchableOpacity onPress={flipCard} activeOpacity={1}>
      <View style={[styles.cardContainer, { height }]}>
        {/* Front Side */}
        <Animated.View
          style={[
            styles.card,
            {
              height,
              transform: [{ rotateY: frontInterpolate }],
              position: "absolute",
              width: "100%",
              backfaceVisibility: "hidden",
              zIndex: flipped ? 0 : 1,
            },
          ]}
        >
          <Image source={frontImage} style={styles.image} />
          <View style={styles.backOverlay}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: getFullImageUrl(info?.companyOrIndividualImage) }}
                style={styles.profileImage}
              />

            </View>
            <Text style={styles.memberCodeText}>{info?.memberCode}</Text>


            <View style={styles.overlayContainer}>
              {overlayItems.map((item, index) => (
                <View key={index} style={styles.iconWithTextRow}>
                  <Image
                    source={item.icon}
                    style={styles.icon}
                    tintColor={colors.text}
                  />
                  <Text style={styles.iconText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>


        </Animated.View>

        {/* Back Side */}
        <Animated.View
          style={[
            styles.card,
            {
              height,
              transform: [{ rotateY: backInterpolate }],
              position: "absolute",
              width: "100%",
              backfaceVisibility: "hidden",
              zIndex: flipped ? 1 : 0,
            },
          ]}
        >
          <Image source={backImage} style={styles.image} />
          <View style={styles.backOverlay}>
            {/* QR Code Center */}
            {!!qrToken && (
              <QRCode
                value={qrToken}
                size={120}
                color={colors.text}
                backgroundColor="white"
                logo={AppLogo}
                logoSize={28}
                logoBorderRadius={14}
                logoBackgroundColor="white"
              />
            )}

            {/* Dates at bottom */}
            <View style={styles.startDateContainer}>
              <Text style={styles.dateText}>
                Start: {info?.startDate ? new Date(info.startDate).toLocaleDateString() : "-"}
              </Text>
            </View>
            <View style={styles.backDatesContainer}>

              <Text style={styles.dateText}>
                End: {info?.endDate ? new Date(info.endDate).toLocaleDateString() : "-"}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    resizeMode: "contain",
  },
  overlayContainer: {
    position: "absolute",
    top: 25,
    right: -130,
    width: 190,
  },
  iconWithTextRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },

  icon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    marginRight: 6,
  },
  iconText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.text,
    fontFamily: FontFamily.Bold,
  },
  profileImageContainer: {
    position: "absolute",
    top: 30,
    right: Platform.OS === 'android' ? 75 : 75,
    width: 80,
    height: 80,
    borderRadius: 9999,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    resizeMode: "contain",
  },
  memberCodeText: {
    position: "absolute",
    top: 120,
    right: Platform.OS === 'android' ? 80 : 80,
    fontFamily: FontFamily.Bold,
    color: '#884600',
    overflow: "hidden",
  },

  skeletonCard: {
    width: "90%",
    borderRadius: 24,
    backgroundColor: colors.cardBg || "#2a2a2a",
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3c3c3c",
    overflow: "hidden",
    marginRight: 20,
  },
  skeletonOverlayContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
  },
  skeletonTextLine: {
    width: "80%",
    height: 14,
    borderRadius: 6,
    backgroundColor: "#4d4d4d",
    overflow: "hidden",
  },
  shimmerOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  backOverlay: {
    flex: 1,
    position: "absolute",
    alignSelf: 'center',
    top: 33
  },

  /* Add these styles for the back dates */
  startDateContainer: {
    position: "absolute",
    bottom: -30,
    left: Platform.OS === 'android' ? -99 : -95,
  },

  backDatesContainer: {
    position: "absolute",
    bottom: -30,
    right: Platform.OS === 'android' ? -99 : -95,
  },

  dateText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text,
    fontFamily: FontFamily.Medium,
  },

});

export default FlipCard;
