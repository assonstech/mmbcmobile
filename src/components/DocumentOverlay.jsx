import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;
const WORD_EXTENSIONS = ["doc", "docx"];

const DocumentOverlay = ({ visible, url, title = "Document", onClose }) => {
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(Date.now());
  const [showWebView, setShowWebView] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const helpTimerRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      clearHelpTimer(helpTimerRef);
      setShowHelp(false);
      return;
    }

    clearHelpTimer(helpTimerRef);
    setLoading(true);
    setHasError(false);
    setShowHelp(false);
    recreateViewer();
  }, [visible, url]);

  const viewerUrl = useMemo(() => getDocumentViewerUrl(url), [url]);

  const recreateViewer = () => {
    clearHelpTimer(helpTimerRef);
    setLoading(true);
    setHasError(false);
    setShowHelp(false);
    setShowWebView(false);

    setTimeout(() => {
      setReloadKey(Date.now());
      setShowWebView(true);
    }, 80);
  };

  const retry = () => {
    recreateViewer();
  };

  const close = () => {
    clearHelpTimer(helpTimerRef);
    setShowWebView(false);
    setLoading(false);
    setHasError(false);
    setShowHelp(false);
    setReloadKey(Date.now());
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <SafeAreaView style={styles.backdrop}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.closeButton}
              onPress={close}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.viewer}>
            {!!viewerUrl && showWebView && (
              <WebView
                key={`${viewerUrl}-${reloadKey}`}
                source={{ uri: viewerUrl }}
                style={styles.webView}
                startInLoadingState
                javaScriptEnabled
                domStorageEnabled
                cacheEnabled={false}
                mixedContentMode="always"
                originWhitelist={["*"]}
                setSupportMultipleWindows={false}
                thirdPartyCookiesEnabled
                onLoadStart={() => {
                  clearHelpTimer(helpTimerRef);
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
                  clearHelpTimer(helpTimerRef);
                  setLoading(false);
                  setHasError(true);
                  setShowHelp(false);
                }}
              />
            )}

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.button} />
              </View>
            )}

            {hasError && (
              <View style={styles.errorOverlay}>
                <Text style={styles.errorText}>Unable to load document.</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.retryButton}
                  onPress={retry}
                >
                  <Text style={styles.retryText}>Retry</Text>
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
                    onPress={retry}
                  >
                    <Text style={styles.helpRetryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const clearHelpTimer = (timerRef) => {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
};

const getDocumentViewerUrl = (url) => {
  if (!url) return "";
  const extension = getFileExtension(url);

  if (WORD_EXTENSIONS.includes(extension)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }

  return `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(url)}`;
};

const getFileExtension = (fileUrl) => {
  const cleanUrl = String(fileUrl).split("?")[0].split("#")[0];
  const fileName = cleanUrl.split("/").pop() || "";
  return fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
};

export default memo(DocumentOverlay);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  panel: {
    height: "88%",
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    minHeight: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.textInputBorderColor,
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.SemiBold,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginRight: 12,
  },
  closeButton: {
    minHeight: 38,
    borderRadius: 9999,
    backgroundColor: colors.button,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  closeText: {
    fontFamily: FontFamily.Medium,
    fontSize: 13,
    color: colors.text,
  },
  viewer: {
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
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingHorizontal: 24,
  },
  errorText: {
    fontFamily: FontFamily.Medium,
    fontSize: 15,
    color: colors.text,
    textAlign: "center",
    marginBottom: 14,
  },
  retryButton: {
    minHeight: 42,
    borderRadius: 9999,
    backgroundColor: "#5A1E08",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  retryText: {
    fontFamily: FontFamily.Medium,
    fontSize: 14,
    color: "white",
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
});
