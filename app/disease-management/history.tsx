import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { API_ENDPOINTS } from "../../config/api";

type Severity = "Healthy" | "Low" | "Medium" | "High" | "Critical";

type ScanRecord = {
  id: string;
  date: string;
  time: string;
  disease: string;
  severity: Severity;
  confidence: number;
  imageUri: string;
  treatment?: string;
};

const DEFAULT_IMAGE = require("../../assets/images/default-leaf.png");

export default function ScanHistoryScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { id: "all", label: "All", icon: "apps" as const },
    { id: "healthy", label: "Healthy", icon: "checkmark-circle" as const },
    { id: "diseased", label: "Diseased", icon: "alert-circle" as const },
  ];

  useEffect(() => {
    fetchHistory();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const getSeverityFromDisease = (disease: string): Severity => {
    switch (disease) {
      case "Healthy":
        return "Healthy";
      case "Aloe Rust":
      case "Anthracnose":
        return "High";
      case "Leaf Spot":
      case "Sunburn":
        return "Medium";
      case "Invalid":
        return "Low";
      default:
        return "Low";
    }
  };

  const getTreatmentFromDisease = (disease: string) => {
    switch (disease) {
      case "Aloe Rust":
        return "Apply fungicide and remove affected leaves";
      case "Anthracnose":
        return "Remove infected parts and apply copper fungicide";
      case "Leaf Spot":
        return "Improve air circulation and avoid overhead watering";
      case "Sunburn":
        return "Move plant to filtered sunlight or provide shade";
      case "Healthy":
        return undefined;
      case "Invalid":
        return "Please scan a clear Aloe vera leaf image";
      default:
        return "Monitor the plant and consult an agricultural expert";
    }
  };

  const formatDateLabel = (dateObj: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(dateObj, today)) return "Today";
    if (sameDay(dateObj, yesterday)) return "Yesterday";

    return dateObj.toLocaleDateString();
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.diseaseHistory);
      const result = await response.json();

      const formatted: ScanRecord[] = (result.data || []).map((item: any) => {
        const dateObj = new Date(item.created_at);
        const confidenceValue =
          Number(item.confidence) <= 1
            ? Number(item.confidence) * 100
            : Number(item.confidence);

        return {
          id: item._id,
          date: formatDateLabel(dateObj),
          time: dateObj.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          disease: item.disease,
          severity: getSeverityFromDisease(item.disease),
          confidence: confidenceValue,
          imageUri: item.image || null,
          treatment: getTreatmentFromDisease(item.disease),
        };
      });

      setScanHistory(formatted);
    } catch (error) {
      console.error("History fetch error:", error);
      setScanHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

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

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case "Healthy":
        return "#E8F5E9";
      case "Low":
        return "#FFF9C4";
      case "Medium":
        return "#FFE0B2";
      case "High":
        return "#FFCCBC";
      case "Critical":
        return "#FFCDD2";
      default:
        return "#F5F5F5";
    }
  };

  const getFilteredScans = () => {
    if (activeFilter === "healthy") {
      return scanHistory.filter((scan) => scan.severity === "Healthy");
    }

    if (activeFilter === "diseased") {
      return scanHistory.filter((scan) => scan.severity !== "Healthy");
    }

    return scanHistory;
  };

  const filteredScans = getFilteredScans();

  const stats = {
    total: scanHistory.length,
    healthy: scanHistory.filter((s) => s.severity === "Healthy").length,
    diseased: scanHistory.filter((s) => s.severity !== "Healthy").length,
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
      <LinearGradient
        colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
        style={styles.container}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1B5E20" />
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.title}>Scan History</Text>
              <Text style={styles.subtitle}>
                {filteredScans.length}{" "}
                {filteredScans.length === 1 ? "scan" : "scans"}
              </Text>
            </View>

            <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
              <Ionicons name="search" size={22} color="#1B5E20" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Ionicons name="scan-circle" size={28} color="#2E7D32" />
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={28} color="#2E7D32" />
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{stats.healthy}</Text>
                <Text style={styles.statLabel}>Healthy</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="alert-circle" size={28} color="#E64A19" />
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{stats.diseased}</Text>
                <Text style={styles.statLabel}>Diseased</Text>
              </View>
            </View>
          </View>

          <View style={styles.filterContainer}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                activeOpacity={0.7}
                style={[
                  styles.filterButton,
                  activeFilter === filter.id && styles.filterButtonActive,
                ]}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Ionicons
                  name={filter.icon}
                  size={18}
                  color={activeFilter === filter.id ? "#FFFFFF" : "#2E7D32"}
                />
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter.id && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>Loading scan history...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.listContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {filteredScans.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="leaf-outline" size={64} color="#A5D6A7" />
                  <Text style={styles.emptyTitle}>No scans found</Text>
                  <Text style={styles.emptySubtitle}>
                    Start scanning aloe leaves to see your history
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyCTA}
                    onPress={() => router.push("/disease-management/capture")}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.emptyCTAText}>Scan Now</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredScans.map((scan, index) => (
                  <Animated.View
                    key={scan.id}
                    style={[
                      styles.scanCard,
                      {
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [50 + index * 10, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={styles.scanCardContent}
                    >
                      <View style={styles.imageContainer}>
                        <Image
  source={
    scan.imageUri
      ? { uri: scan.imageUri }
      : DEFAULT_IMAGE
  }
  style={styles.scanImage}
  resizeMode="cover"
/>
                        <View
                          style={[
                            styles.severityBadge,
                            {
                              backgroundColor: getSeverityBgColor(
                                scan.severity
                              ),
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.severityText,
                              { color: getSeverityColor(scan.severity) },
                            ]}
                          >
                            {scan.severity}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.scanInfo}>
                        <View style={styles.scanHeader}>
                          <Text style={styles.diseaseText}>
                            {scan.disease}
                          </Text>
                          <View style={styles.confidenceBadge}>
                            <Ionicons
                              name="speedometer-outline"
                              size={12}
                              color="#1B5E20"
                            />
                            <Text style={styles.confidenceText}>
                              {scan.confidence.toFixed(1)}%
                            </Text>
                          </View>
                        </View>

                        <View style={styles.dateRow}>
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#666"
                          />
                          <Text style={styles.dateText}>{scan.date}</Text>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#666"
                          />
                          <Text style={styles.dateText}>{scan.time}</Text>
                        </View>

                        {scan.treatment && (
                          <View style={styles.treatmentRow}>
                            <Ionicons
                              name="medical-outline"
                              size={14}
                              color="#2E7D32"
                            />
                            <Text
                              style={styles.treatmentText}
                              numberOfLines={2}
                            >
                              {scan.treatment}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#A5D6A7"
                      />
                    </TouchableOpacity>
                  </Animated.View>
                ))
              )}
            </ScrollView>
          )}
        </Animated.View>

        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => router.push("/disease-management/capture")}
        >
          <LinearGradient
            colors={["#2E7D32", "#1B5E20"]}
            style={styles.fabGradient}
          >
            <Ionicons name="camera" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
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
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
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
  searchButton: {
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
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardPrimary: {
    backgroundColor: "#E8F5E9",
  },
  statContent: {
    alignItems: "center",
    marginTop: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1B5E20",
  },
  statLabel: {
    fontSize: 11,
    color: "#4E6E4E",
    fontWeight: "600",
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  filterButtonActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  scanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  scanCardContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    gap: 12,
  },
  imageContainer: {
    position: "relative",
  },
  scanImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  severityBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  scanInfo: {
    flex: 1,
    gap: 6,
  },
  scanHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  diseaseText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    flex: 1,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1B5E20",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  treatmentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#F1F8F4",
    padding: 8,
    borderRadius: 8,
    marginTop: 2,
  },
  treatmentText: {
    fontSize: 11,
    color: "#2E7D32",
    fontWeight: "600",
    flex: 1,
    lineHeight: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B5E20",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#4E6E4E",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  emptyCTA: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 24,
  },
  emptyCTAText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    borderRadius: 30,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});