import React, { memo, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Pdf from "react-native-pdf";
import { WebView } from "react-native-webview";

import DarkColors from "../colors/dark";
import LightColors from "../colors/light";
import { FontFamily } from "../styles/fontStyle";

const isDarkMode = true;
const colors = isDarkMode ? DarkColors : LightColors;

const PDF_EXTENSIONS = ["pdf"];
const WORD_EXTENSIONS = ["doc", "docx"];

const DocumentOverlay = ({ visible, url, title = "Document", onClose }) => {
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(Date.now());
  const [pdfDataUri, setPdfDataUri] = useState("");

  const documentUrl = useMemo(() => normalizeDocumentUrl(url), [url]);
  const extension = useMemo(() => getFileExtension(documentUrl), [documentUrl]);
  const isPdf = PDF_EXTENSIONS.includes(extension);

  const viewerUrl = useMemo(() => {
    if (!documentUrl || isPdf) return "";

    if (WORD_EXTENSIONS.includes(extension)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        documentUrl
      )}`;
    }

    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
      documentUrl
    )}`;
  }, [documentUrl, extension, isPdf]);

  const pdfSource = useMemo(() => {
    if (!pdfDataUri || !isPdf) return null;

    return {
      uri: pdfDataUri,
    };
  }, [pdfDataUri, isPdf]);

  useEffect(() => {
    if (visible) {
      console.log("Document URL:", documentUrl);

      setHasError(false);
      setPdfDataUri("");
      setReloadKey(Date.now());

      if (!isPdf) {
        setLoading(true);
      }
    } else {
      setLoading(false);
      setHasError(false);
      setPdfDataUri("");
    }
  }, [visible, documentUrl, isPdf]);

  useEffect(() => {
    if (!visible || !documentUrl || !isPdf) return;

    let isActive = true;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setHasError(false);

        const response = await fetch(documentUrl, {
          method: "GET",
          headers: {
            Accept: "application/pdf",
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error(`PDF request failed: ${response.status}`);
        }

        const blob = await response.blob();
        const dataUri = await readBlobAsPdfDataUri(blob);

        if (isActive) {
          setPdfDataUri(dataUri);
        }
      } catch (error) {
        console.log("PDF download error:", error);

        if (isActive) {
          setLoading(false);
          setHasError(true);
        }
      }
    };

    loadPdf();

    return () => {
      isActive = false;
    };
  }, [visible, documentUrl, isPdf, reloadKey]);

  const retry = () => {
    setLoading(true);
    setHasError(false);
    setReloadKey(Date.now());
  };

  const close = () => {
    setLoading(false);
    setHasError(false);
    setReloadKey(Date.now());
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <SafeAreaView style={styles.backdrop}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

            <TouchableOpacity activeOpacity={0.85} style={styles.closeButton} onPress={close}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.viewer}>
            {!documentUrl && (
              <View style={styles.errorOverlay}>
                <Text style={styles.errorText}>Unable to load document.</Text>
              </View>
            )}

            {!!pdfSource && !hasError && (
              <Pdf
                key={`${documentUrl}-${reloadKey}`}
                source={pdfSource}
                style={styles.pdf}
                trustAllCerts={false}
                enablePaging={false}
                enableAnnotationRendering
                onLoadProgress={() => {
                  setLoading(true);
                }}
                onLoadComplete={() => {
                  setLoading(false);
                }}
                onError={(error) => {
                  console.log("PDF render error:", error);
                  setLoading(false);
                  setHasError(true);
                }}
              />
            )}

            {!!viewerUrl && !hasError && (
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
                allowsInlineMediaPlayback
                onLoadStart={() => {
                  setLoading(true);
                  setHasError(false);
                }}
                onLoadEnd={() => {
                  setLoading(false);
                }}
                onError={(error) => {
                  console.log("WebView error:", error.nativeEvent);
                  setLoading(false);
                  setHasError(true);
                }}
                onHttpError={(error) => {
                  console.log("WebView HTTP error:", error.nativeEvent);
                  setLoading(false);
                  setHasError(true);
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

                <TouchableOpacity activeOpacity={0.85} style={styles.retryButton} onPress={retry}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const normalizeDocumentUrl = (fileUrl) => {
  if (!fileUrl) return "";

  return encodeURI(String(fileUrl).trim());
};

const getFileExtension = (fileUrl) => {
  const cleanUrl = String(fileUrl || "").split("?")[0].split("#")[0];
  const fileName = cleanUrl.split("/").pop() || "";

  return fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "";
};

const readBlobAsPdfDataUri = (blob) => (
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;

      resolve(`data:application/pdf;base64,${base64}`);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  })
);

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
  pdf: {
    flex: 1,
    width: "100%",
    height: "100%",
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
    marginTop: 10,
  },
  retryText: {
    fontFamily: FontFamily.Medium,
    fontSize: 14,
    color: "white",
  },
});
