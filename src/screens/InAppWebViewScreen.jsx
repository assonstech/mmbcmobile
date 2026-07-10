import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import HeaderWithActions from "../components/HeaderWithActions";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;
const LOADING_TIMEOUT_MS = 8000;

const InAppWebViewScreen = ({ navigation, route }) => {
    const { url, title = "Website" } = route?.params || {};
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showWebView, setShowWebView] = useState(true);
    const [reloadKey, setReloadKey] = useState(Date.now());
    const webViewRef = useRef(null);

    const normalizedUrl = normalizeUrl(url);

    const recreateWebView = useCallback(() => {
        setLoading(true);
        setHasError(false);
        setShowWebView(false);

        setTimeout(() => {
            setReloadKey(Date.now());
            setShowWebView(true);
        }, 80);
    }, []);

    useEffect(() => {
        if (normalizedUrl) {
            recreateWebView();
        }
    }, [normalizedUrl, recreateWebView]);

    useEffect(() => {
        if (!loading || hasError) return undefined;

        const timeout = setTimeout(() => {
            setLoading(false);
        }, LOADING_TIMEOUT_MS);

        return () => clearTimeout(timeout);
    }, [loading, hasError, reloadKey]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerWrapper}>
                <HeaderWithActions
                    title={title}
                    onBackPress={() => navigation.goBack()}
                />
            </View>

            {!normalizedUrl ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Unable to open website.</Text>
                </View>
            ) : (
                <View style={styles.webContainer}>
                    {showWebView && (
                        <WebView
                            ref={webViewRef}
                            key={`${normalizedUrl}-${reloadKey}`}
                            source={{ uri: normalizedUrl }}
                            style={styles.webView}
                            startInLoadingState
                            onLoadStart={() => {
                                setLoading(true);
                                setHasError(false);
                            }}
                            onLoadProgress={({ nativeEvent }) => {
                                if (nativeEvent.progress >= 0.7) {
                                    setLoading(false);
                                }
                            }}
                            onLoadEnd={() => setLoading(false)}
                            onError={() => {
                                setLoading(false);
                                setHasError(true);
                            }}
                            javaScriptEnabled
                            domStorageEnabled
                            cacheEnabled
                            cacheMode="LOAD_DEFAULT"
                            mixedContentMode="always"
                            originWhitelist={["*"]}
                            setSupportMultipleWindows={false}
                            thirdPartyCookiesEnabled
                        />
                    )}

                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={colors.button} />
                        </View>
                    )}

                    {hasError && (
                        <View style={styles.errorOverlay}>
                            <Text style={styles.errorText}>Website could not load.</Text>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.retryButton}
                                onPress={recreateWebView}
                            >
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

const normalizeUrl = (value) => {
    if (!value) return "";
    const text = String(value).trim();
    if (!text) return "";
    if (text.startsWith("http://") || text.startsWith("https://")) return text;
    return `https://${text}`;
};

export default InAppWebViewScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bottomTabbarLabelColor,
    },
    headerWrapper: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    webContainer: {
        flex: 1,
        backgroundColor: "white",
    },
    webView: {
        flex: 1,
        backgroundColor: "white",
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: "white",
    },
    emptyText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: colors.text,
        textAlign: "center",
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: "white",
    },
    errorText: {
        fontFamily: FontFamily.Medium,
        fontSize: 16,
        color: colors.text,
        textAlign: "center",
        marginBottom: 14,
    },
    retryButton: {
        minHeight: 44,
        borderRadius: 9999,
        backgroundColor: "#5A1E08",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 22,
    },
    retryText: {
        fontFamily: FontFamily.Medium,
        fontSize: 14,
        color: "white",
    },
});
