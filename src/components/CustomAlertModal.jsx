import React, { useEffect, useRef } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    Pressable,
} from "react-native";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const CustomAlertModal = ({
    visible,
    onCancel,
    onConfirm,
    title,
    message,
    icon,
    cancelText = "Cancel",
    confirmText = "Confirm",
    confirmDisabled = false,
    confirmStyle,
    cancelStyle,
    centered = true,
}) => {
    const fade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(fade, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fade, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, fade]);

    return (
        <Modal
            visible={visible}
            transparent
            statusBarTranslucent
            animationType="none"
            onRequestClose={onCancel}
        >
            <Animated.View style={[styles.backdrop, { opacity: fade }]}>
                <Pressable style={styles.backdropTouchable} onPress={onCancel} />
            </Animated.View>

            <View style={[styles.container, centered && styles.centeredContainer]}>
                <Animated.View
                    style={[
                        styles.modalCard,
                        {
                            transform: [
                                {
                                    scale: fade.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.98, 1],
                                    }),
                                },
                            ],
                            opacity: fade,
                        },
                    ]}
                >
                    {/* Icon (rounded background, positioned at start) */}
                    {icon ? (
                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircle}>
                                {typeof icon === "number" ? (
                                    <Image
                                        source={icon}
                                        style={styles.icon}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    icon
                                )}
                            </View>
                        </View>
                    ) : null}

                    {/* Title */}
                    {title ? <Text style={styles.title}>{title}</Text> : null}

                    {/* Message */}
                    {message ? <Text style={styles.message}>{message}</Text> : null}

                    {/* Buttons */}
                    <View style={styles.buttonsRow}>
                        {onCancel && (
                            <TouchableOpacity
                                onPress={onCancel}
                                style={[styles.cancelBtn, cancelStyle]}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.buttonText]}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={onConfirm}
                            activeOpacity={0.85}
                            disabled={confirmDisabled}
                            style={[
                                styles.confirmBtn,
                                confirmDisabled && styles.confirmBtnDisabled,
                                confirmStyle,
                            ]}
                        >
                            <Text style={styles.buttonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default CustomAlertModal;

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    backdropTouchable: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: "flex-end",
    },
    centeredContainer: {
        justifyContent: "center",
    },
    modalCard: {
        marginHorizontal: 24,
        backgroundColor: colors.backgroundCard || "#fff",
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 20,
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        minWidth: 280,
    },

    // --- Icon area ---
    iconContainer: {
        alignItems: "flex-start", // align left
        marginBottom: 12,
    },
    iconCircle: {
        backgroundColor: colors.alertBgColor,
        borderRadius: 9999,
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: colors.button || "#0A84FF",
    },

    // --- Text ---
    title: {
        fontFamily: FontFamily.SemiBold,
        fontSize: 24,
        color: colors.text,
        fontWeight: '600',
        lineHeight: 32,
        textAlign: "left",
        marginBottom: 6,
    },
    message: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: colors.loginAccountColor,
        textAlign: "left",
        marginBottom: 20,
        fontWeight: '500',
        lineHeight: 24,
    },

    // --- Buttons ---
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8
    },
    cancelBtn: {
        flex: 1,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: colors.textInputBorderColor,
        backgroundColor: 'white',
        alignItems: "center",
        justifyContent: "center",
    },
    confirmBtn: {
        flex: 1,
        borderRadius: 9999,
        backgroundColor: colors.button || "#0A84FF",
        alignItems: "center",
        justifyContent: "center",
    },
    confirmBtnDisabled: {
        backgroundColor: "#D32F2F",
        opacity: 0.7,
    },
    buttonText: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontFamily: FontFamily.Medium,
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
    },

});
