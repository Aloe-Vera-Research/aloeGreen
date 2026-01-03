import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  StatusBar,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

type ResultData = {
  diseaseName: string;
  confidence: number;
  category: "Healthy" | "Disease" | "Pest" | "Deficiency";
  severity: "Healthy" | "Low" | "Medium" | "High" | "Critical";
  description: string;
  causes: string[];
  treatment: string[];
  prevention: string[];
  spreadRisk: "None" | "Low" | "Medium" | "High";
  imageUri: string;
};

export default function DiseaseResultScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
    causes: false,
    treatment: true,
    prevention: false,
  });

  // Mock result data - replace with actual data from route params or state
  const result: ResultData = {
    diseaseName: "Aloe Rust (Fungal)",
    confidence: 92.5,
    category: "Disease",
    severity: "High",
    description:
      "Aloe rust is a fungal disease caused by Phakopsora pachyrhizi that appears as reddish-brown or black spots on Aloe Vera leaves. It thrives in humid conditions and can spread rapidly if left untreated, potentially affecting entire plantations.",
    causes: [
      "High moisture and humidity levels (>80%)",
      "Poor air circulation around plants",
      "Fungal spores from infected nearby plants",
      "Overhead watering that keeps leaves wet",
      "Dense planting without proper spacing",
    ],
    treatment: [
      "Remove and destroy all infected leaves immediately",
      "Apply copper-based fungicide spray (2-3 times weekly)",
      "Isolate infected plants from healthy ones",
      "Improve drainage around affected plants",
      "Apply neem oil solution as organic alternative",
    ],
    prevention: [
      "Ensure proper spacing between plants (30-45cm)",
      "Avoid overhead watering - water at base only",
      "Maintain good air circulation",
      "Regular inspection of leaves for early signs",
      "Apply preventive fungicide during humid seasons",
      "Remove dead or dying leaves promptly",
    ],
    spreadRisk: "High",
    imageUri: "https://unsplash.com/photos/a-close-up-of-a-green-plant-with-spots-on-it-FayaAwrIR8c",
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Healthy":
        return "#2E7D32";
      case "Low":
        return "#FBC02D";
      case "Medium":
        return "#F57C00";
      case "High":
        return "#E64A19";
      case "Critical":
        return "#C62828";
      default:
        return "#757575";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Healthy":
        return "checkmark-circle" as const;
      case "Low":
        return "alert-circle-outline" as const;
      case "Medium":
        return "alert-circle" as const;
      case "High":
        return "warning" as const;
      case "Critical":
        return "alert" as const;
      default:
        return "help-circle" as const;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "None":
        return "#2E7D32";
      case "Low":
        return "#FBC02D";
      case "Medium":
        return "#F57C00";
      case "High":
        return "#D32F2F";
      default:
        return "#757575";
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Disease Detection Result:\n${result.diseaseName}\nConfidence: ${result.confidence}%\nSeverity: ${result.severity}\n\nDetected using Aloe Vera Farm Manager`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleSection = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
      <LinearGradient
        colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Image */}
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#1B5E20" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Ionicons name="share-social" size={22} color="#1B5E20" />
              </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
              <Image source={{ uri: result.imageUri }} style={styles.resultImage} />
              <View
                style={[
                  styles.severityOverlay,
                  { backgroundColor: getSeverityColor(result.severity) },
                ]}
              >
                <Ionicons
                  name={getSeverityIcon(result.severity)}
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.severityText}>{result.severity}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Result Header Card */}
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <View style={styles.resultHeaderLeft}>
                <Text style={styles.diseaseName}>{result.diseaseName}</Text>
                <Text style={styles.category}>{result.category}</Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Ionicons name="analytics" size={20} color="#2E7D32" />
                <View>
                  <Text style={styles.confidenceLabel}>Confidence</Text>
                  <Text style={styles.confidenceValue}>
                    {result.confidence.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="speedometer" size={18} color={getSeverityColor(result.severity)} />
                <Text style={styles.statLabel}>Severity</Text>
                <Text style={[styles.statValue, { color: getSeverityColor(result.severity) }]}>
                  {result.severity}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="warning" size={18} color={getRiskColor(result.spreadRisk)} />
                <Text style={styles.statLabel}>Spread Risk</Text>
                <Text style={[styles.statValue, { color: getRiskColor(result.spreadRisk) }]}>
                  {result.spreadRisk}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Description Card */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>About This Condition</Text>
            </View>
            <Text style={styles.description}>{result.description}</Text>
          </Animated.View>

          {/* Treatment Card (Expanded by default) */}
          <Animated.View
            style={[
              styles.card,
              styles.treatmentCard,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => toggleSection("treatment")}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="medical" size={24} color="#FFFFFF" />
                <Text style={[styles.cardTitle, styles.cardTitleWhite]}>
                  Recommended Treatment
                </Text>
              </View>
              <Ionicons
                name={expanded.treatment ? "chevron-up" : "chevron-down"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            {expanded.treatment && (
              <View style={styles.cardContent}>
                {result.treatment.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bulletWhite}>
                      <Text style={styles.bulletNumber}>{index + 1}</Text>
                    </View>
                    <Text style={styles.listTextWhite}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Causes Card (Collapsible) */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => toggleSection("causes")}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="search" size={24} color="#2E7D32" />
                <Text style={styles.cardTitle}>Possible Causes</Text>
              </View>
              <Ionicons
                name={expanded.causes ? "chevron-up" : "chevron-down"}
                size={24}
                color="#2E7D32"
              />
            </TouchableOpacity>
            {expanded.causes && (
              <View style={styles.cardContent}>
                {result.causes.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bullet}>
                      <Ionicons name="alert-circle" size={16} color="#F57C00" />
                    </View>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Prevention Card (Collapsible) */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => toggleSection("prevention")}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="shield-checkmark" size={24} color="#2E7D32" />
                <Text style={styles.cardTitle}>Prevention Tips</Text>
              </View>
              <Ionicons
                name={expanded.prevention ? "chevron-up" : "chevron-down"}
                size={24}
                color="#2E7D32"
              />
            </TouchableOpacity>
            {expanded.prevention && (
              <View style={styles.cardContent}>
                {result.prevention.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bullet}>
                      <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                    </View>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Community Alert Card */}
          {result.spreadRisk !== "None" && (
            <Animated.View
              style={[
                styles.card,
                styles.alertCard,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <View style={styles.alertIconWrapper}>
                <Ionicons name="people" size={32} color="#2E7D32" />
              </View>
              <Text style={styles.alertTitle}>Community Disease Alert</Text>
              <Text style={styles.alertText}>
                This disease has a {result.spreadRisk.toLowerCase()} spread risk and can
                affect nearby farms. Notify other farmers to take preventive measures.
              </Text>
              <TouchableOpacity
  style={styles.alertButton}
  activeOpacity={0.85}
  onPress={() => {
    router.push({
      pathname: "/disease-management/community-alert",
      params: {
        disease: result.diseaseName,
        severity: result.severity,
        spreadRisk: result.spreadRisk,
      },
    });
  }}
>

                <LinearGradient
                  colors={["#2E7D32", "#1B5E20"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.alertButtonGradient}
                >
                  <Ionicons name="notifications" size={22} color="#FFFFFF" />
                  <Text style={styles.alertButtonText}>Alert Nearby Farmers</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => router.push("/disease-management/history")}
              activeOpacity={0.85}
            >
              <Ionicons name="time-outline" size={22} color="#2E7D32" />
              <Text style={styles.secondaryActionText}>View History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => router.replace("/disease-management/capture")}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#2E7D32", "#1B5E20"]}
                style={styles.primaryActionGradient}
              >
                <Ionicons name="camera" size={22} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>Scan Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Home Button */}
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace("/(tabs)/home")}
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={20} color="#2E7D32" />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
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
  },
  shareButton: {
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
  },
  imageContainer: {
    width: "100%",
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  resultImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  severityOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  severityText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  resultHeaderLeft: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 4,
    lineHeight: 28,
  },
  category: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 10,
    color: "#4E6E4E",
    fontWeight: "600",
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E7D32",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: "#E0E0E0",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  treatmentCard: {
    backgroundColor: "#2E7D32",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1B5E20",
    flex: 1,
  },
  cardTitleWhite: {
    color: "#FFFFFF",
  },
  cardContent: {
    marginTop: 14,
    gap: 10,
  },
  description: {
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 22,
    marginTop: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bullet: {
    marginTop: 2,
  },
  bulletWhite: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
  },
  bulletNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2E7D32",
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 20,
  },
  listTextWhite: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20,
  },
  alertCard: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 5,
    borderLeftColor: "#2E7D32",
  },
  alertIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 22,
    marginBottom: 16,
  },
  alertButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  alertButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  alertButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: "#2E7D32",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryActionText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryActionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
  },
  homeButtonText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "600",
  },
});