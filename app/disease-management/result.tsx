import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";

// Disease data configuration
const diseaseData = {
  "Aloe Rust": {
    category: "Disease",
    severity: "High",
    description: "Aloe rust is a fungal disease caused by Phakopsora pachyrhizi that appears as reddish-brown or black spots on Aloe Vera leaves. It thrives in humid conditions and can spread rapidly if left untreated.",
    causes: [
      "High moisture and humidity levels (>80%)",
      "Poor air circulation around plants",
      "Fungal spores from infected nearby plants",
      "Overhead watering that keeps leaves wet",
      "Dense planting without proper spacing"
    ],
    treatment: [
      "Remove and destroy all infected leaves immediately",
      "Apply copper-based fungicide spray (2-3 times weekly)",
      "Isolate infected plants from healthy ones",
      "Improve drainage around affected plants",
      "Apply neem oil solution as organic alternative"
    ],
    prevention: [
      "Ensure proper spacing between plants (30-45cm)",
      "Avoid overhead watering - water at base only",
      "Maintain good air circulation",
      "Regular inspection of leaves for early signs",
      "Apply preventive fungicide during humid seasons",
      "Remove dead or dying leaves promptly"
    ],
    spreadRisk: "High"
  },
  "Anthracnose": {
    category: "Disease",
    severity: "High",
    description: "Anthracnose is a fungal disease caused by Colletotrichum species that creates dark, sunken lesions on aloe leaves. It can cause significant damage during warm, wet conditions and may lead to complete leaf collapse.",
    causes: [
      "Warm, humid weather conditions",
      "Water splashing on leaves spreading spores",
      "Wounded or damaged leaf tissue",
      "Poor sanitation practices",
      "Infected plant debris left near plants"
    ],
    treatment: [
      "Prune and destroy infected plant parts immediately",
      "Apply fungicide containing chlorothalonil or mancozeb",
      "Remove debris and dead plant material around plants",
      "Reduce watering frequency temporarily",
      "Treat with copper-based fungicide every 7-10 days"
    ],
    prevention: [
      "Water early in the day so leaves dry quickly",
      "Space plants adequately for air flow",
      "Remove and destroy infected leaves promptly",
      "Disinfect pruning tools between plants",
      "Apply preventive fungicide before rainy season",
      "Avoid working with plants when wet"
    ],
    spreadRisk: "High"
  },
  "Healthy": {
    category: "Healthy",
    severity: "Healthy",
    description: "Your aloe plant appears to be in excellent health! The leaves show no signs of disease, pest damage, or nutritional deficiencies. Continue your current care routine to maintain plant health.",
    causes: [],
    treatment: [
      "Continue regular watering schedule",
      "Maintain current fertilization routine",
      "Keep monitoring plant health weekly",
      "Ensure adequate sunlight exposure",
      "No treatment needed - plant is healthy"
    ],
    prevention: [
      "Water deeply but infrequently (every 2-3 weeks)",
      "Provide 6-8 hours of indirect sunlight daily",
      "Use well-draining soil mix",
      "Fertilize with balanced fertilizer quarterly",
      "Inspect leaves regularly for early problem detection",
      "Maintain good air circulation around plants"
    ],
    spreadRisk: "None"
  },
  "Leaf Spot": {
    category: "Disease",
    severity: "Medium",
    description: "Leaf spot is a bacterial or fungal infection that causes circular brown or black spots on aloe leaves. While not immediately life-threatening, it can weaken plants and spread if left untreated.",
    causes: [
      "Bacterial infection from contaminated water",
      "Fungal spores in humid conditions",
      "Physical damage to leaf surface",
      "Poor air circulation",
      "Overhead watering hitting leaves"
    ],
    treatment: [
      "Remove affected leaves or cut out spotted sections",
      "Apply bactericide or fungicide depending on cause",
      "Improve air circulation around plant",
      "Reduce watering frequency",
      "Spray with neem oil solution weekly",
      "Ensure soil drains properly"
    ],
    prevention: [
      "Water at soil level, not on leaves",
      "Provide adequate spacing between plants",
      "Use sterile tools for pruning",
      "Avoid overhead irrigation",
      "Remove dead or dying foliage promptly",
      "Apply preventive copper spray monthly"
    ],
    spreadRisk: "Medium"
  },
  "Sunburn": {
    category: "Environmental",
    severity: "Medium",
    description: "Sunburn occurs when aloe plants are exposed to intense direct sunlight, especially after being in shade. It appears as brown, reddish, or white patches on leaves and can permanently scar the plant.",
    causes: [
      "Sudden exposure to intense direct sunlight",
      "Moving plant from shade to full sun quickly",
      "Insufficient acclimatization period",
      "Reflection from nearby surfaces intensifying sun",
      "Summer heat combined with direct afternoon sun"
    ],
    treatment: [
      "Move plant to location with filtered sunlight",
      "Provide shade during hottest part of day (12-4pm)",
      "Do not remove sunburned leaves (they still photosynthesize)",
      "Increase watering slightly to help plant recover",
      "Apply shade cloth (30-50% shade) temporarily",
      "Allow plant to gradually acclimate to brighter light"
    ],
    prevention: [
      "Gradually introduce plant to brighter light over 2-3 weeks",
      "Provide afternoon shade in hot climates",
      "Use shade cloth during peak summer months",
      "Place plant where it gets morning sun, afternoon shade",
      "Monitor leaf color - pale green indicates too much sun",
      "Keep well-watered during hot weather"
    ],
    spreadRisk: "None"
  }
};

export default function ResultScreen() {
  const router = useRouter();
  const { disease, confidence } = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  const [expanded, setExpanded] = useState({
    causes: false,
    treatment: true,
    prevention: false
  });
const diseaseKey = disease as keyof typeof diseaseData;
  // Get disease info, default to a generic disease if not found
  const diseaseInfo = diseaseData[diseaseKey] || {
    category: "Unknown",
    severity: "Unknown",
    description: "Disease information not available.",
    causes: [],
    treatment: ["Consult with an agricultural expert"],
    prevention: ["Regular monitoring recommended"],
    spreadRisk: "Unknown"
  };

  const confidenceNum = Number(confidence) * 100;

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
      case "Healthy": return "#2E7D32";
      case "Low": return "#FBC02D";
      case "Medium": return "#F57C00";
      case "High": return "#E64A19";
      case "Critical": return "#C62828";
      default: return "#757575";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Healthy": return "checkmark-circle" as const;
      case "Low": return "alert-circle-outline" as const;
      case "Medium": return "alert-circle" as const;
      case "High": return "warning" as const;
      case "Critical": return "alert" as const;
      default: return "help-circle" as const;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "None": return "#2E7D32";
      case "Low": return "#FBC02D";
      case "Medium": return "#F57C00";
      case "High": return "#D32F2F";
      default: return "#757575";
    }
  };

  const toggleSection = (section: "causes" | "treatment" | "prevention") => {
  setExpanded((prev) => ({
    ...prev,
    [section]: !prev[section],
  }));
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
          {/* Header */}
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1B5E20" />
            </TouchableOpacity>
          </Animated.View>

          {/* Result Card */}
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
                <Text style={styles.diseaseName}>{disease}</Text>
                <Text style={styles.category}>{diseaseInfo.category}</Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Ionicons name="analytics" size={20} color="#2E7D32" />
                <View>
                  <Text style={styles.confidenceLabel}>Confidence</Text>
                  <Text style={styles.confidenceValue}>
                    {confidenceNum.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="speedometer" size={18} color={getSeverityColor(diseaseInfo.severity)} />
                <Text style={styles.statLabel}>Severity</Text>
                <Text style={[styles.statValue, { color: getSeverityColor(diseaseInfo.severity) }]}>
                  {diseaseInfo.severity}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="warning" size={18} color={getRiskColor(diseaseInfo.spreadRisk)} />
                <Text style={styles.statLabel}>Spread Risk</Text>
                <Text style={[styles.statValue, { color: getRiskColor(diseaseInfo.spreadRisk) }]}>
                  {diseaseInfo.spreadRisk}
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
            <Text style={styles.description}>{diseaseInfo.description}</Text>
          </Animated.View>

          {/* Treatment Card (Expanded by default) */}
          <Animated.View
            style={[
              styles.card,
              styles.treatmentCard,
              { opacity: fadeAnim },
            ]}
          >
            <TouchableOpacity
              style={styles.cardHeaderButton}
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
                {diseaseInfo.treatment.map((item, index) => (
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
          {diseaseInfo.causes.length > 0 && (
            <Animated.View
              style={[styles.card, { opacity: fadeAnim }]}
            >
              <TouchableOpacity
                style={styles.cardHeaderButton}
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
                  {diseaseInfo.causes.map((item, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons name="alert-circle" size={16} color="#F57C00" />
                      <Text style={styles.listText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          )}

          {/* Prevention Card (Collapsible) */}
          <Animated.View
            style={[styles.card, { opacity: fadeAnim }]}
          >
            <TouchableOpacity
              style={styles.cardHeaderButton}
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
                {diseaseInfo.prevention.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Community Alert - Only show for high spread risk */}
          {diseaseInfo.spreadRisk === "High" && (
            <Animated.View
              style={[styles.card, styles.alertCard, { opacity: fadeAnim }]}
            >
              <View style={styles.alertIconWrapper}>
                <Ionicons name="people" size={32} color="#2E7D32" />
              </View>
              <Text style={styles.alertTitle}>Community Disease Alert</Text>
              <Text style={styles.alertText}>
                This disease has a high spread risk and can affect nearby farms. Consider notifying other farmers to take preventive measures.
              </Text>
              <TouchableOpacity
                style={styles.alertButton}
                activeOpacity={0.85}
                onPress={() => {
                  router.push({
                    pathname: "/disease-management/community-alert",
                    params: {
                      disease: disease,
                      severity: diseaseInfo.severity,
                      spreadRisk: diseaseInfo.spreadRisk,
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
    paddingHorizontal: 20,
  },
  headerSection: {
    marginBottom: 20,
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
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
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
  cardHeaderButton: {
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
  bulletWhite: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
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
    alignSelf: "center",
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
    textAlign: "center",
  },
  alertText: {
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 22,
    marginBottom: 16,
    textAlign: "center",
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