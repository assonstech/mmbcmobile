import React, { useCallback, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";
import HeaderWithActions from "../components/HeaderWithActions";
import Screen from "../utils/Screen";
import RadioCard from "../components/CustomRadioCard";
import { registerEvent } from "../controllers/EventController";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const EventRegistrationAsScreen = ({ navigation, route }) => {
  const { onFinish, eventId } = route.params || "";

  const [selectedId, setSelectedId] = useState(1);
  const [loading, setLoading] = useState(false); // 🟢 loading state
  const [error, setError] = useState("");

  const options = [
    {
      id: 1,
      title: "Me",
      body: "This registration is only for you. You’ll need to attend the event.",
    },
    {
      id: 2,
      title: "Me & Others",
      body: "This registration is for you and other people. You’ll need to attend the event.",
    },
    {
      id: 3,
      title: "Others",
      body: "This registration is for you and other people. You’ll need to attend the event.",
    },
  ];

  const handleNextPress = () => {
    if (loading) return; // 🧱 Prevent multiple clicks while loading

    if (selectedId === 1) {
      register();
    } else if (selectedId === 2 || selectedId === 3) {
      navigation.navigate(Screen.GuestScreen, {
        eventId: eventId,
        isMemberInclude: selectedId === 2,
        onFinish: onFinish, 

      });
    }
  };

  const register = async () => {
    try {
      setLoading(true);
      setError("");

      const payload = {
        eventId: eventId,
        isMemberInclude: true,
      };


      const res = await registerEvent(payload);

      if (res.success) {
        if (onFinish) onFinish();
        navigation.goBack();
      } else {
        setError(res.message || "Failed to register event");
      }
    } catch (err) {
      console.error("register error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const onClick = useCallback((selectedId) => {
    setSelectedId(selectedId);
  })

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithActions
        onBackPress={() => navigation.goBack()}
        showNext={!loading} // hide next button when loading
        onNextPress={handleNextPress}
      />

      <Text style={styles.headerTitle}>Register As</Text>
      <Text style={styles.bodyText}>
        Choose how you want to register for this event
      </Text>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {options.map((item) => (
          <RadioCard
            key={item.id}
            title={item.title}
            body={item.body}
            selected={selectedId === item.id}
            onPress={() => onClick(item.id)}
            colors={colors}
          />
        ))}
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary || "#007AFF"} />
          <Text style={styles.loadingText}>Registering...</Text>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </SafeAreaView>
  );
};

export default EventRegistrationAsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  headerTitle: {
    fontFamily: FontFamily.SemiBold,
    paddingTop: 32,
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  bodyText: {
    fontFamily: FontFamily.Medium,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: colors.loginAccountColor,
    marginTop: 6,
    marginBottom: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#333",
    fontFamily: FontFamily.Medium,
  },
  errorText: {
    fontFamily: FontFamily.Medium,
    fontSize: 14,
    color: "#D32F2F",
    marginTop: 12,
    textAlign: "center",
  },
});
