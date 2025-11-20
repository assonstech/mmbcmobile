// screens/NetworkError.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontFamily } from '../styles/fontStyle';

const { width } = Dimensions.get('window');

export default function NetworkErrorScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Heading */}
      <Text style={styles.title}>Network Error</Text>

      {/* Message */}
      <Text style={styles.message}>
        Oops! Something went wrong. Please check your internet connection and try again.
      </Text>

      {/* Retry Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily:FontFamily.Medium
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    fontFamily:FontFamily.SemiBold
  },
  button: {
    backgroundColor: '#FACC15',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5, 
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
