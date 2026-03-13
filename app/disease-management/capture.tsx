import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function CaptureLeafScreen() {
  // const API_URL = "http://192.168.1.4:8000/api/detect";
  const API_URL = "http://192.168.1.4:8000/api/disease/detect";
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const cornerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulsing frame animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scanning line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Corner glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(cornerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const cornerOpacity = cornerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 120],
  });

  const handleCapture = async () => {
    if (!hasPermission) {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed to scan leaves"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      // Navigate to analyzing screen
      // router.push("/disease-management/analyzing");
    }
  };

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      // Navigate to analyzing screen
      // router.push("/disease-management/analyzing");
    }
  };
const analyzeImage = async () => {
  if (!selectedImage) {
    Alert.alert("No image", "Please capture or select an image first.");
    return;
  }

  router.push({
    pathname: "/disease-management/analyzing",
    params: {
      imageUri: selectedImage,
    },
  });
};

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
      <LinearGradient
        colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
        style={styles.container}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1B5E20" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Scan Aloe Leaf</Text>
            <Text style={styles.subtitle}>
              Position the leaf clearly within the frame for accurate detection
            </Text>
          </View>

          {/* Camera Frame with Animation */}
          <View style={styles.frameContainer}>
            <Animated.View
              style={[
                styles.cameraFrame,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              {/* Animated corners */}
              <Animated.View
                style={[styles.cornerTL, { opacity: cornerOpacity }]}
              />
              <Animated.View
                style={[styles.cornerTR, { opacity: cornerOpacity }]}
              />
              <Animated.View
                style={[styles.cornerBL, { opacity: cornerOpacity }]}
              />
              <Animated.View
                style={[styles.cornerBR, { opacity: cornerOpacity }]}
              />

              {/* Scanning line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslate }],
                  },
                ]}
              />

              {/* Content */}
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.previewImage}
                />
              ) : (
                <>
                  <View style={styles.iconContainer}>
                    <Ionicons name="leaf-outline" size={72} color="#81C784" />
                  </View>
                  <Text style={styles.frameText}>Align leaf here</Text>
                  <View style={styles.gridOverlay}>
                    <View style={styles.gridLine} />
                    <View style={[styles.gridLine, styles.gridLineVertical]} />
                  </View>
                </>
              )}
            </Animated.View>

            {/* Info Badge */}
            <View style={styles.infoBadge}>
              <Ionicons name="information-circle" size={16} color="#2E7D32" />
              <Text style={styles.infoBadgeText}>Detection ready</Text>
            </View>
          </View>

          {/* Tips Section */}
          <View style={styles.tipsContainer}>
            <View style={styles.tipRow}>
              <View style={styles.tipIconBg}>
                <Ionicons name="sunny-outline" size={18} color="#F57C00" />
              </View>
              <Text style={styles.tipText}>Use natural light</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipIconBg}>
                <Ionicons name="eye-outline" size={18} color="#1976D2" />
              </View>
              <Text style={styles.tipText}>Focus on leaf surface</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipIconBg}>
                <Ionicons name="hand-left-outline" size={18} color="#7B1FA2" />
              </View>
              <Text style={styles.tipText}>Hold steady</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {selectedImage && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.analyzeButton}
                // onPress={() => router.push("/disease-management/analyzing")}
                onPress={analyzeImage}

              >
                <LinearGradient
                  colors={["#2E7D32", "#1B5E20"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.analyzeButtonGradient}
                >
                  <Ionicons name="search" size={22} color="#fff" />
                  <Text style={styles.analyzeButtonText}>Analyze Now</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.actionButton,
                  selectedImage && styles.actionButtonSecondary,
                ]}
                onPress={handleCapture}
              >
                <Ionicons
                  name="camera"
                  size={24}
                  color={selectedImage ? "#2E7D32" : "#fff"}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    selectedImage && styles.actionButtonTextSecondary,
                  ]}
                >
                  {selectedImage ? "Retake" : "Capture"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.actionButton,
                  styles.actionButtonOutline,
                ]}
                onPress={handleGallery}
              >
                <Ionicons name="image-outline" size={24} color="#2E7D32" />
                <Text style={styles.actionButtonTextOutline}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#2E7D32",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  frameContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  cameraFrame: {
    width: 280,
    height: 280,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#81C784",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
    overflow: "hidden",
    position: "relative",
  },
  iconContainer: {
    marginBottom: 12,
  },
  frameText: {
    fontSize: 14,
    color: "#4E6E4E",
    fontWeight: "600",
  },
  cornerTL: {
    position: "absolute",
    top: -3,
    left: -3,
    width: 40,
    height: 40,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#2E7D32",
    borderTopLeftRadius: 20,
  },
  cornerTR: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 40,
    height: 40,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: "#2E7D32",
    borderTopRightRadius: 20,
  },
  cornerBL: {
    position: "absolute",
    bottom: -3,
    left: -3,
    width: 40,
    height: 40,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#2E7D32",
    borderBottomLeftRadius: 20,
  },
  cornerBR: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 40,
    height: 40,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: "#2E7D32",
    borderBottomRightRadius: 20,
  },
  scanLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "#2E7D32",
    opacity: 0.6,
  },
  gridOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  gridLine: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "#81C784",
    opacity: 0.3,
    top: "50%",
  },
  gridLineVertical: {
    width: 1,
    height: "100%",
    left: "50%",
    top: 0,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  infoBadgeText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },
  tipsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F8F4",
    justifyContent: "center",
    alignItems: "center",
  },
  tipText: {
    fontSize: 14,
    color: "#1B5E20",
    fontWeight: "600",
    flex: 1,
  },
  actionsContainer: {
    gap: 12,
  },
  analyzeButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  analyzeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonSecondary: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  actionButtonOutline: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2E7D32",
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  actionButtonTextSecondary: {
    color: "#2E7D32",
  },
  actionButtonTextOutline: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "700",
  },
});