import React,{memo} from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import DarkColors from '../colors/dark';
import LightColors from '../colors/light';
import { FontFamily } from '../styles/fontStyle';

const isDarkMode = true; // default dark mode
const colors = isDarkMode ? DarkColors : LightColors;

function DefaultButton({ title, onPress, style, textStyle, ...props }) {
    console.log("deaftbutton")
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      {...props}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

export default memo(DefaultButton)

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.button,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: FontFamily.Regular,
    color:colors.text,
    fontWeight:'500',
    lineHeight:24
  },
});
