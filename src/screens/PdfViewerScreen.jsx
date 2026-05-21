import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import HeaderWithActions from "../components/HeaderWithActions";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;
const WORD_EXTENSIONS = ["doc", "docx"];

const PdfViewerScreen = ({ navigation, route }) => {
    const { url, title = "Document" } = route?.params || {};
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showWebView, setShowWebView] = useState(true);
    const [reloadKey, setReloadKey] = useState(Date.now());
    const [showHelp, setShowHelp] = useState(false);
    const helpTimerRef = useRef(null);

    const clearHelpTimer = useCallback(() => {
        if (helpTimerRef.current) {
            clearTimeout(helpTimerRef.current);
            helpTimerRef.current = null;
        }
    }, []);

    const recreateViewer = useCallback(() => {
        clearHelpTimer();
        setLoading(true);
        setHasError(false);
        setShowHelp(false);
        setShowWebView(false);

        setTimeout(() => {
            setReloadKey(Date.now());
            setShowWebView(true);
        }, 80);
    }, [clearHelpTimer]);

    useFocusEffect(
        useCallback(() => {
            recreateViewer();

            return () => {
                clearHelpTimer();
                setShowWebView(false);
            };
        }, [clearHelpTimer, recreateViewer])
    );

    const viewerUrl = useMemo(() => {
        if (!url) return "";

        const extension = getFileExtension(url);

        if (WORD_EXTENSIONS.includes(extension)) {
            return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
        }

        return `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(url)}`;
    }, [url]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerWrapper}>
                <HeaderWithActions
                    title={title}
                    onBackPress={() => navigation.goBack()}
                />
            </View>

            {!url ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Unable to load document.</Text>
                </View>
            ) : (
                <View style={styles.viewerContainer}>
                    {showWebView && (
                        <WebView
                            key={`${viewerUrl}-${reloadKey}`}
                            source={{ uri: viewerUrl }}
                            style={styles.webView}
                            startInLoadingState
                            onLoadStart={() => {
                                clearHelpTimer();
                                setLoading(true);
                                setHasError(false);
                                setShowHelp(false);
                            }}
                            onLoadEnd={() => {
                                setLoading(false);
                                helpTimerRef.current = setTimeout(() => {
                                    setShowHelp(true);
                                }, 1200);
                            }}
                            onError={() => {
                                clearHelpTimer();
                                setLoading(false);
                                setHasError(true);
                                setShowHelp(false);
                            }}
                            javaScriptEnabled
                            domStorageEnabled
                            cacheEnabled={false}
                            mixedContentMode="always"
                            originWhitelist={["*"]}
                            setSupportMultipleWindows={false}
                            thirdPartyCookiesEnabled
                            onFileDownload={() => { }}
                        />
                    )}

                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={colors.button} />
                        </View>
                    )}

                    {hasError && (
                        <View style={styles.errorOverlay} pointerEvents="box-none">
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.retryButton}
                                onPress={recreateViewer}
                            >
                                <Text style={styles.retryText}>Retry Document</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {showHelp && !hasError && (
                        <View style={styles.helpOverlay} pointerEvents="box-none">
                            <View style={styles.helpBox}>
                                <Text style={styles.helpText}>
                                    If the document is blank, tap Retry.
                                </Text>
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={styles.helpRetryButton}
                                    onPress={recreateViewer}
                                >
                                    <Text style={styles.helpRetryText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

const getFileExtension = (fileUrl) => {
    const cleanUrl = String(fileUrl).split("?")[0].split("#")[0];
    const fileName = cleanUrl.split("/").pop() || "";
    return fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
};

export default PdfViewerScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bottomTabbarLabelColor,
    },
    headerWrapper: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    viewerContainer: {
        flex: 1,
        width: "100%",
        backgroundColor: "white",
        overflow: "hidden",
    },
    webView: {
        flex: 1,
        width: "100%",
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
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 24,
        alignItems: "center",
    },
    helpOverlay: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 18,
        alignItems: "center",
    },
    helpBox: {
        width: "100%",
        maxWidth: 360,
        minHeight: 48,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: "rgba(255,255,255,0.96)",
        borderWidth: 1,
        borderColor: "#E4D4D4",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    helpText: {
        flex: 1,
        fontFamily: FontFamily.Medium,
        fontSize: 13,
        color: colors.text,
        marginRight: 10,
    },
    helpRetryButton: {
        minWidth: 74,
        minHeight: 34,
        borderRadius: 9999,
        backgroundColor: "#5A1E08",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
    },
    helpRetryText: {
        fontFamily: FontFamily.Medium,
        fontSize: 13,
        color: "white",
    },
    retryButton: {
        backgroundColor: "#5A1E08",
        borderRadius: 9999,
        paddingHorizontal: 18,
        paddingVertical: 12,
    },
    retryText: {
        fontFamily: FontFamily.Medium,
        fontSize: 14,
        color: "white",
    },
});
