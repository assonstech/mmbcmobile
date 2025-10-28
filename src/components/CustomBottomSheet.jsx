import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Pressable,
} from 'react-native';

const { height } = Dimensions.get('window');
const SNAP_POINT = height * 0.5; // 50% height

export default function CustomBottomSheet({ visible, onClose, children }) {
  const translateY = useRef(new Animated.Value(height)).current;

  // Animate open / close
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? SNAP_POINT : height,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
  }, [visible]);

  // Backdrop opacity
  const backdropOpacity = translateY.interpolate({
    inputRange: [SNAP_POINT, height],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  // Gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(SNAP_POINT + gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100 || gesture.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: SNAP_POINT,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
        </Pressable>
      )}

      {/* Sheet */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.sheet,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.handle} />
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
});
