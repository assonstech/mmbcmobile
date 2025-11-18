import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import HubScreen from '../screens/HubScreen';
import MoreScreen from '../screens/MoreScreen';

import HomeIcon from '../assets/icons/home.png';
import ProfileIcon from '../assets/icons/slider-vertical.png';
import SettingIcon from '../assets/icons/endo-category.png';
import DarkColors from '../colors/dark';
import LightColors from '../colors/light';
import { FontFamily } from '../styles/fontStyle';

const Tab = createBottomTabNavigator();
const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconSource =
          route.name === 'Home'
            ? HomeIcon
            : route.name === 'Hub'
            ? ProfileIcon
            : SettingIcon;

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            activeOpacity={0.9}
            style={styles.tabItem}
          >
            <View
              style={[
                styles.tabInner,
                { 
                  paddingHorizontal:35,
                  paddingVertical:10,
                  backgroundColor: isFocused ? colors.button : 'transparent',
                  borderRadius: 9999, 
                },
              ]}
            >
              <Image
                source={iconSource}
                style={[
                  styles.icon,
                  { tintColor: isFocused ? colors.text : colors.bottomTabbarLabelColor },
                ]}
                resizeMode="contain"
              />
              <Text
                style={{
                  color: isFocused ? colors.text : colors.bottomTabbarLabelColor,
                  fontSize: 12,
                  fontWeight: '500',
                  marginTop: 4,
                  fontFamily:FontFamily.Regular
                }}
              >
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: colors.bottomTabBgColor,
    borderRadius: 9999,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    overflow: 'hidden', 
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default function MyTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Hub" component={HubScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
