import React, { memo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import DarkColors from '../colors/dark';
import LightColors from '../colors/light';
import { FontFamily } from '../styles/fontStyle';

const isDarkMode = true; // default dark mode
const colors = isDarkMode ? DarkColors : LightColors;

function DefaultTextInput({ label, placeholder, secureTextEntry, style, ...props }) {
    console.log("ffdfere")
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  return (
    <View style={{ marginBottom: 20 }}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.placeHolderColor}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          style={[styles.input, style]}
          {...props}
        />

        {/* Eye icon only if secureTextEntry is true */}
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer} hitSlop={15}>
            <Image
              source={
                isPasswordVisible
                  ? require('../assets/icons/eye.png') 
                  : require('../assets/icons/eyeSlash.png') 
              }
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default memo(DefaultTextInput);

const styles = StyleSheet.create({
  label: {
    fontFamily: FontFamily.Regular,
    fontSize: 14,
    lineHeight:20,
    fontWeight:'500',
    marginBottom: 8,
    color: colors.text,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 15,
    borderWidth: 1,
    height: 56,
    borderColor: colors.textInputBorderColor,
    borderRadius: 20,
    fontFamily: FontFamily.Regular,
    fontSize: 16,
    fontWeight:'500',
    lineHeight:24,
    color: colors.text,
    paddingRight: 45,
  },
  iconContainer: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: colors.text, 
    resizeMode: 'contain',
  },
});
