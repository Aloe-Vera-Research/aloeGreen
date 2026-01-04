import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function FertilizerPlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Get data from params
  const soilType = params.soil as string;
  const plantStage = params.stage as string;
  const temperature = params.temperature as string;
  const moisture = params.moisture as string;
  const soilPH = params.soilPH as string;
  const N = params.N as string;
  const P = params.P as string;
  const K = params.K as string;
  const fromHistory = params.fromHistory === "true";

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
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Generate recommendations based on NPK levels
  const recommendedFertilizers = [
    {
      type: N === "Low" ? "Urea (High Nitrogen)" : "Balanced NPK",
      dosage: plantStage === "Baby" ? "15g per plant" : "20g per plant",
      timing: "Morning",
      icon: "leaf" as const,
      color: "#4CAF50",
    },
    {
      type: P === "Low" ? "DAP (Phosphorus Rich)" : "Bone Meal",
      dosage: plantStage === "Baby" ? "10g per plant" : "15g per plant",
      timing: "Evening",
      icon: "flask" as const,
      color: "#FF9800",
    },
    {
      type: K === "Low" ? "Potash (High Potassium)" : "Wood Ash",
      dosage: "10g per plant",
      timing: "Morning",
      icon: "nutrition" as const,
      color: "#2196F3",
    },
  ];

  const adviceText = `For ${soilType} soil with ${plantStage} stage plants: ${
    N === "Low" ? "Increase nitrogen fertilizer." : ""
  } ${P === "Low" ? "Add phosphorus supplement." : ""} ${
    K === "Low" ? "Apply potassium booster." : ""
  } Maintain soil pH at ${soilPH}. Always water after application and avoid over-fertilizing.`;

  const speakAdvice = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(adviceText, {
        language: "en",
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const getNPKColor = (level: string) => {
    switch (level) {
      case "High":
        return "#4CAF50";
      case "Medium":
        return "#FF9800";
      case "Low":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  return (
    <LinearGradient
      colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1B5E20" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerIconWrapper}>
              <Ionicons name="document-text" size={28} color="#2E7D32" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Your Fertilizer Plan</Text>
              <Text style={styles.headerSubtitle}>
                Customized for {plantStage} plants
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Summary Card */}
        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.summaryTitle}>Environment Overview</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="layers" size={20} color="#2E7D32" />
              <Text style={styles.summaryLabel}>Soil</Text>
              <Text style={styles.summaryValue}>{soilType}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="thermometer" size={20} color="#2E7D32" />
              <Text style={styles.summaryLabel}>Temp</Text>
              <Text style={styles.summaryValue}>{temperature}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="water" size={20} color="#2E7D32" />
              <Text style={styles.summaryLabel}>Moisture</Text>
              <Text style={styles.summaryValue}>{moisture}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="beaker" size={20} color="#2E7D32" />
              <Text style={styles.summaryLabel}>pH</Text>
              <Text style={styles.summaryValue}>{soilPH}</Text>
            </View>
          </View>

          {/* NPK Status */}
          <View style={styles.npkSection}>
            <Text style={styles.npkTitle}>Current NPK Levels</Text>
            <View style={styles.npkGrid}>
              {[
                { label: "Nitrogen", value: N, color: getNPKColor(N) },
                { label: "Phosphorus", value: P, color: getNPKColor(P) },
                { label: "Potassium", value: K, color: getNPKColor(K) },
              ].map((item, index) => (
                <View key={index} style={styles.npkItem}>
                  <Text style={styles.npkLabel}>{item.label}</Text>
                  <View style={styles.npkBarContainer}>
                    <View style={styles.npkBar}>
                      <View
                        style={[
                          styles.npkBarFill,
                          {
                            width:
                              item.value === "High"
                                ? "80%"
                                : item.value === "Medium"
                                ? "50%"
                                : "25%",
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.npkValue, { color: item.color }]}
                    >
                      {item.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Recommendations Section */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Recommended Fertilizers</Text>

          {recommendedFertilizers.map((item, index) => (
            <Animated.View
              key={index}
              style={[
                styles.fertilizerCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, 30 + index * 10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.fertilizerIcon, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <View style={styles.fertilizerContent}>
                <Text style={styles.fertilizerType}>{item.type}</Text>
                <View style={styles.fertilizerDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="scale-outline" size={16} color="#4E6E4E" />
                    <Text style={styles.detailText}>{item.dosage}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color="#4E6E4E" />
                    <Text style={styles.detailText}>{item.timing}</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* AI Advice Card */}
        <Animated.View
          style={[
            styles.adviceCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.adviceHeader}>
            <View style={styles.adviceIconWrapper}>
              <MaterialIcons name="smart-toy" size={28} color="#2E7D32" />
            </View>
            <Text style={styles.adviceTitle}>AI Recommendations</Text>
          </View>
          <Text style={styles.adviceText}>{adviceText}</Text>

          <TouchableOpacity
            style={styles.speakButton}
            onPress={speakAdvice}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isSpeaking ? ["#F44336", "#D32F2F"] : ["#2E7D32", "#1B5E20"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.speakButtonGradient}
            >
              <Ionicons
                name={isSpeaking ? "stop-circle" : "volume-high"}
                size={22}
                color="#fff"
              />
              <Text style={styles.speakButtonText}>
                {isSpeaking ? "Stop Reading" : "Read Aloud"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Application Tips */}
        <Animated.View
          style={[
            styles.tipsCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.tipsTitle}>Application Tips</Text>
          <View style={styles.tipsList}>
            {[
              "Apply fertilizer in the early morning or late evening",
              "Water plants thoroughly after fertilizer application",
              "Keep fertilizer away from the base of the plant stem",
              "Monitor plant response and adjust dosage if needed",
            ].map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Extra Feature */}
        <TouchableOpacity
          style={styles.extraFeature}
          onPress={() => router.push("/fertilizer-management/AnalyzerScreen")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F1F8F4"]}
            style={styles.extraFeatureGradient}
          >
            <View style={styles.extraFeatureIcon}>
              <Ionicons name="analytics" size={32} color="#2E7D32" />
            </View>
            <View style={styles.extraFeatureContent}>
              <Text style={styles.extraFeatureTitle}>
                Usage Tracker & AI Insights
              </Text>
              <Text style={styles.extraFeatureDescription}>
                Track fertilizer usage and get weekly AI recommendations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#2E7D32" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Action Buttons */}
        {!fromHistory && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={() => {
                // Save plan logic
                router.push("/fertilizer-management/history");
              }}
            >
              <LinearGradient
                colors={["#2E7D32", "#1B5E20"]}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.actionButtonText}>Save Plan</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryActionButton]}
              activeOpacity={0.85}
              onPress={() => router.push("/fertilizer-management")}
            >
              <Ionicons name="refresh" size={22} color="#2E7D32" />
              <Text style={styles.secondaryActionButtonText}>Create New</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B5E20",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    minWidth: "22%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#4E6E4E",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
  },
  npkSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  npkTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 12,
  },
  npkGrid: {
    gap: 12,
  },
  npkItem: {
    gap: 8,
  },
  npkLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4E6E4E",
  },
  npkBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  npkBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  npkBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  npkValue: {
    fontSize: 12,
    fontWeight: "700",
    minWidth: 60,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 16,
  },
  fertilizerCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 14,
  },
  fertilizerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  fertilizerContent: {
    flex: 1,
    justifyContent: "center",
  },
  fertilizerType: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 6,
  },
  fertilizerDetails: {
    gap: 4,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#4E6E4E",
    fontWeight: "500",
  },
  adviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  adviceIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
  },
  adviceText: {
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 22,
    marginBottom: 16,
  },
  speakButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  speakButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  speakButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  tipsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 14,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  tipNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 20,
  },
  extraFeature: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  extraFeatureGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  extraFeatureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  extraFeatureContent: {
    flex: 1,
  },
  extraFeatureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 4,
  },
  extraFeatureDescription: {
    fontSize: 13,
    color: "#4E6E4E",
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryActionButton: {
    backgroundColor: "#FFFFFF",
    shadowOpacity: 0.1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  secondaryActionButtonText: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "700",
  },
});