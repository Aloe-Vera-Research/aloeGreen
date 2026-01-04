import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Platform } from "react-native-reanimated/lib/typescript/ReanimatedModule/js-reanimated/JSReanimated";

const { width } = Dimensions.get("window");

export default function YieldDashboard() {
  const router = useRouter();
  const [plantCount, setPlantCount] = useState<number>(0);
  const [plantAgeMonths, setPlantAgeMonths] = useState<number>(0);
  const [perPlantYield, setPerPlantYield] = useState<number>(0);

  const FARM_SETUP_KEY = "FARM_SETUP";
const API_URL = "http://192.168.1.6:8000/predict";





  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Hard-coded prototype values
  // const perPlantYield = 220; // grams
  const totalYieldKg = ((perPlantYield * plantCount) / 1000).toFixed(1);
  const modelConfidence = 0.89;
  const lastUpdated = "Today • 10:45 AM";

  useEffect(() => {
    loadFarmSetup();

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

  const fetchYieldPrediction = async (plantAgeMonths: number) => {
  try {
    const payload = {
      soil_ph: 6.5,
      soil_organic_matter_pct: 2.8,
      soil_moisture_pct: 38,
      irrigation_mm: 4,
      temp_day_c: 32.5,
      humidity_pct: 70,
      rainfall_mm: 1.2,

      // 🔥 MUST be numbers
      plant_age_months: Number(plantAgeMonths),
      soil_texture_enc: 1,

      // optional (backend can also auto-generate)
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("BACKEND ERROR:", err);
      return;
    }

    const data = await response.json();
    setPerPlantYield(data.gel_weight_g);

  } catch (err) {
    console.error("FETCH FAILED:", err);
  }
};




  const loadFarmSetup = async () => {
  const data = await AsyncStorage.getItem("FARM_SETUP");
  if (!data) return;

  const parsed = JSON.parse(data);
  setPlantCount(parsed.plantCount);

  const plantingDate = new Date(parsed.plantingDate);
  const today = new Date();

  const rawMonths =
  (today.getFullYear() - plantingDate.getFullYear()) * 12 +
  (today.getMonth() - plantingDate.getMonth());

// ✅ API requires >= 1
const safeMonths = Math.max(1, rawMonths);

setPlantAgeMonths(safeMonths);
fetchYieldPrediction(safeMonths);

};


  const quickActions = [
    {
      title: "Environment",
      icon: "leaf",
      route: "/yield/environment",
      color: "#4CAF50",
      bgColor: "#E8F5E9",
    },
    {
      title: "Scenarios",
      icon: "flask",
      route: "/yield/scenario",
      color: "#2196F3",
      bgColor: "#E3F2FD",
    },
    {
      title: "History",
      icon: "time",
      route: "/yield/history",
      color: "#FF9800",
      bgColor: "#FFF3E0",
    },
    {
      title: "Alerts",
      icon: "notifications",
      route: "/yield/alert",
      color: "#F44336",
      bgColor: "#FFEBEE",
    },
  ];

  return (
    <LinearGradient
      colors={["#E8F5E9", "#F1F8E9", "#FFFFFF"]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerIconWrapper}>
              <MaterialCommunityIcons
                name="graph-outline"
                size={32}
                color="#2E7D32"
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Yield Dashboard</Text>
              <Text style={styles.subtitle}>Real-time estimation & insights</Text>
            </View>
          </View>

          {/* Status Banner */}
          <View style={styles.statusBanner}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Crop Status: Healthy</Text>
            </View>
            <Text style={styles.lastUpdated}>{lastUpdated}</Text>
          </View>
        </Animated.View>

        {/* Main Yield Card */}
        <Animated.View
          style={[
            styles.mainCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={["#2E7D32", "#1B5E20"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCardGradient}
          >
            <View style={styles.mainCardHeader}>
              <View style={styles.mainCardIconWrapper}>
                <Ionicons name="leaf" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.mainLabel}>Per Plant Yield</Text>
            </View>
            <Text style={styles.mainValue}>
  {perPlantYield.toFixed(2)}g
</Text>

            <View style={styles.mainCardFooter}>
              <Ionicons name="information-circle" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.mainNote}>
                Based on current environmental conditions
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View
          style={[
            styles.statsGrid,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E8F5E9" }]}>
              <MaterialCommunityIcons name="sprout" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statLabel}>Plant Count</Text>
            <Text style={styles.statValue}>{plantCount}</Text>
            <Text style={styles.statSubtext}>Active plants</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="calendar" size={24} color="#FF9800" />
            </View>
            <Text style={styles.statLabel}>Plant Age</Text>
            <Text style={styles.statValue}>{plantAgeMonths}</Text>
            <Text style={styles.statSubtext}>Months old</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E3F2FD" }]}>
              <MaterialCommunityIcons name="check-decagram" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>
              {(modelConfidence * 100).toFixed(0)}%
            </Text>
            <Text style={styles.statSubtext}>Model confidence</Text>
          </View>
        </Animated.View>

        {/* Total Yield Card */}
        <Animated.View
          style={[
            styles.totalCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.totalCardHeader}>
            <View style={styles.totalIconWrapper}>
              <MaterialCommunityIcons name="scale" size={24} color="#2E7D32" />
            </View>
            <Text style={styles.totalLabel}>Estimated Total Yield</Text>
          </View>
          <Text style={styles.totalValue}>{totalYieldKg} kg</Text>
          {plantCount > 0 && (
            <View style={styles.totalFooter}>
              <Ionicons name="calculator" size={14} color="#4E6E4E" />
              <Text style={styles.totalNote}>
                Calculated using {plantCount} plants
              </Text>
            </View>
          )}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((parseFloat(totalYieldKg) / 100) * 100, 100)}%` },
              ]}
            />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Animated.View
                key={index}
                style={[
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[styles.quickActionCard, { backgroundColor: action.bgColor }]}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: action.color + "30" },
                    ]}
                  >
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                  </View>
                  <Text style={[styles.quickActionText, { color: action.color }]}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Edit Farm Setup Button */}
        <TouchableOpacity
          onPress={() => router.push("/yield/farm-setup")}
          style={styles.editButton}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F8F9FA"]}
            style={styles.editButtonGradient}
          >
            <View style={styles.editButtonContent}>
              <View style={styles.editIconWrapper}>
                <Ionicons name="settings" size={20} color="#2E7D32" />
              </View>
              <View style={styles.editTextContainer}>
                <Text style={styles.editButtonTitle}>Farm Setup</Text>
                <Text style={styles.editButtonSubtext}>
                  Update plants, area & date
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Insights Card */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <View style={styles.insightsIconWrapper}>
              <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FF9800" />
            </View>
            <Text style={styles.insightsTitle}>Insights</Text>
          </View>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                Your plants are {plantAgeMonths} months old - optimal harvest time is approaching
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                Expected yield is {parseFloat(totalYieldKg) > 50 ? "above" : "within"} average range
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                Model confidence at {(modelConfidence * 100).toFixed(0)}% - predictions are reliable
              </Text>
            </View>
          </View>
        </View>
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
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
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
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1B5E20",
  },
  subtitle: {
    fontSize: 14,
    color: "#4E6E4E",
    fontWeight: "500",
  },
  statusBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  lastUpdated: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  mainCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mainCardGradient: {
    padding: 24,
  },
  mainCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  mainCardIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  mainValue: {
    fontSize: 56,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: -2,
  },
  mainCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mainNote: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 11,
    color: "#9E9E9E",
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: "#BDBDBD",
    fontWeight: "500",
  },
  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  totalCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  totalIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    color: "#4E6E4E",
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#2E7D32",
    marginBottom: 8,
    letterSpacing: -1,
  },
  totalFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  totalNote: {
    fontSize: 13,
    color: "#4E6E4E",
    fontWeight: "500",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  quickActionCard: {
    width: (width - 56) / 2,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  editButton: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  editButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  editIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  editTextContainer: {
    flex: 1,
  },
  editButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 2,
  },
  editButtonSubtext: {
    fontSize: 12,
    color: "#4E6E4E",
    fontWeight: "500",
  },
  insightsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  insightsIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF9800",
    marginTop: 7,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 20,
  },
});