import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const CustomDatePicker = ({ visible, onCancel, onConfirm, initialDate }) => {
  const [tempDate, setTempDate] = useState(initialDate || new Date());
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  // Show Android picker when `visible` becomes true
  useEffect(() => {
    if (Platform.OS === "android" && visible) {
      setShowAndroidPicker(true);
    }
  }, [visible]);

  const handleAndroidChange = (event, date) => {
    setShowAndroidPicker(false); // hide picker after selection
    if (event.type === "dismissed") {
      onCancel?.();
    } else if (date) {
      onConfirm(date);
    }
  };

  const handleIOSConfirm = () => {
    onConfirm(tempDate);
  };

  // iOS Modal Picker
  if (Platform.OS === "ios") {
    if (!visible) return null;
    return (
      <Modal transparent animationType="fade" onRequestClose={onCancel}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              textColor='black'
              onChange={(event, date) => date && setTempDate(date)}
              style={{ width: "100%" }}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={onCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleIOSConfirm}>
                <Text style={[styles.buttonText, { fontWeight: "600" }]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Android Inline Picker
  return showAndroidPicker ? (
    <DateTimePicker
      value={tempDate}
      mode="date"
      display="default"
      onChange={handleAndroidChange}
    />
  ) : null;
};

export default CustomDatePicker;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    minWidth: 300,
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#007AFF",
  },
});
