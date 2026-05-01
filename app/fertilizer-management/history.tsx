import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { API_ENDPOINTS } from "../../config/api";

const HISTORY_URL = API_ENDPOINTS.fertilizerHistory;

type FertilizerInputData = {
  Soil_pH?: number;
  N?: number;
  P?: number;
  K?: number;
  Soil_Moisture?: number;
  Soil_Type?: string;
  Plant_Age_Category?: string;
  Application_Timing?: string;
  Additional_Advice?: string;
};

type FertilizerPredictionResult = {
  recommended_fertilizer?: string;
  recommended_dosage_g_per_plant?: number;
};

type FertilizerHistoryItem = {
  id: string;
  input_data: FertilizerInputData;
  prediction_result: FertilizerPredictionResult;
  created_at: string;
};

export default function FertilizerHistory() {
  const router = useRouter();

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [history, setHistory] = useState<FertilizerHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const filters = ["All", "Today", "This Month"];

  useEffect(() => {
    loadHistory();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchHistory = async () => {
    const response = await fetch(HISTORY_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(rawText || "Failed to load fertilizer history.");
    }

    let parsed: any = null;

    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
      throw new Error("Backend returned invalid JSON.");
    }

    if (!parsed?.success) {
      throw new Error(parsed?.detail || "Failed to load fertilizer history.");
    }

    return parsed.data || [];
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await fetchHistory();
      setHistory(data);
    } catch (error: any) {
      setErrorMessage(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setErrorMessage("");

      const data = await fetchHistory();
      setHistory(data);
    } catch (error: any) {
      setErrorMessage(error?.message || "Something went wrong while refreshing.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredHistory = history.filter((item) => {
    if (selectedFilter === "All") return true;

    const createdDate = new Date(item.created_at);
    const now = new Date();

    if (selectedFilter === "Today") {
      return (
        createdDate.getFullYear() === now.getFullYear() &&
        createdDate.getMonth() === now.getMonth() &&
        createdDate.getDate() === now.getDate()
      );
    }

    if (selectedFilter === "This Month") {
      return (
        createdDate.getFullYear() === now.getFullYear() &&
        createdDate.getMonth() === now.getMonth()
      );
    }

    return true;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNPKColor = (value?: number) => {
    if (value === undefined || value === null) return "#9E9E9E";
    if (value >= 60) return "#4CAF50";
    if (value >= 30) return "#FF9800";
    return "#F44336";
  };

  const openHistoryPlan = (item: FertilizerHistoryItem) => {
    const input = item.input_data || {};
    const result = item.prediction_result || {};

    const predictionPayload = {
      success: true,
      data: {
        history_id: item.id,
        prediction: result,
      },
    };

    router.push({
      pathname: "/fertilizer-management/plan",
      params: {
        soil: input.Soil_Type || "N/A",
        stage: input.Plant_Age_Category || "N/A",
        moisture:
          input.Soil_Moisture !== undefined
            ? String(Math.round(input.Soil_Moisture))
            : "N/A",
        soilPH:
          input.Soil_pH !== undefined ? String(Number(input.Soil_pH).toFixed(1)) : "N/A",
        N: input.N !== undefined ? String(input.N) : "N/A",
        P: input.P !== undefined ? String(input.P) : "N/A",
        K: input.K !== undefined ? String(input.K) : "N/A",
        applicationTiming: input.Application_Timing || "N/A",
        additionalAdvice: input.Additional_Advice || "",
        prediction: JSON.stringify(predictionPayload),
        fromHistory: "true",
      },
    });
  };

  const renderHistoryCard = ({
    item,
    index,
  }: {
    item: FertilizerHistoryItem;
    index: number;
  }) => {
    const input = item.input_data || {};
    const result = item.prediction_result || {};

    return (
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 30],
                  outputRange: [0, 30 + index * 8],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.planCard}
          onPress={() => openHistoryPlan(item)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#4E6E4E" />
              <View>
                <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
              </View>
            </View>

            <View style={styles.fertilizerBadge}>
              <Ionicons name="leaf-outline" size={14} color="#2E7D32" />
              <Text style={styles.fertilizerBadgeText} numberOfLines={1}>
                {result.recommended_fertilizer || "Fertilizer"}
              </Text>
            </View>
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationLabel}>Recommended Dosage</Text>
            <Text style={styles.recommendationValue}>
              {result.recommended_dosage_g_per_plant !== undefined
                ? `${result.recommended_dosage_g_per_plant} g / plant`
                : "Not available"}
            </Text>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="layers-outline" size={20} color="#2E7D32" />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Soil Type</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {input.Soil_Type || "N/A"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="analytics-outline" size={20} color="#2E7D32" />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Plant Stage</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {input.Plant_Age_Category || "N/A"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sensorRow}>
              <View style={styles.sensorItem}>
                <Ionicons name="water-outline" size={16} color="#4E6E4E" />
                <Text style={styles.sensorText}>
                  {input.Soil_Moisture !== undefined
                    ? `${Math.round(input.Soil_Moisture)}%`
                    : "N/A"}
                </Text>
              </View>

              <View style={styles.sensorItem}>
                <Ionicons name="beaker-outline" size={16} color="#4E6E4E" />
                <Text style={styles.sensorText}>
                  pH {input.Soil_pH !== undefined ? Number(input.Soil_pH).toFixed(1) : "N/A"}
                </Text>
              </View>

              <View style={styles.sensorItem}>
                <Ionicons name="time-outline" size={16} color="#4E6E4E" />
                <Text style={styles.sensorText} numberOfLines={1}>
                  {input.Application_Timing || "N/A"}
                </Text>
              </View>
            </View>

            <View style={styles.npkRow}>
              <Text style={styles.npkLabel}>NPK Values:</Text>

              <View style={styles.npkBadges}>
                <View
                  style={[
                    styles.npkBadge,
                    { backgroundColor: getNPKColor(input.N) },
                  ]}
                >
                  <Text style={styles.npkBadgeText}>N: {input.N ?? "N/A"}</Text>
                </View>

                <View
                  style={[
                    styles.npkBadge,
                    { backgroundColor: getNPKColor(input.P) },
                  ]}
                >
                  <Text style={styles.npkBadgeText}>P: {input.P ?? "N/A"}</Text>
                </View>

                <View
                  style={[
                    styles.npkBadge,
                    { backgroundColor: getNPKColor(input.K) },
                  ]}
                >
                  <Text style={styles.npkBadgeText}>K: {input.K ?? "N/A"}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.viewDetailsText}>View Prediction Details</Text>
            <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Prediction History</Text>
          <Text style={styles.headerSubtitle}>
            {filteredHistory.length} record
            {filteredHistory.length !== 1 ? "s" : ""} found
          </Text>
        </View>

        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshButton}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={22} color="#1B5E20" />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.filterContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              activeOpacity={0.7}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterPill,
                selectedFilter === filter && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading fertilizer history...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="warning-outline" size={64} color="#F44336" />
          </View>

          <Text style={styles.emptyTitle}>Unable to Load History</Text>
          <Text style={styles.emptyDescription}>{errorMessage}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2E7D32"
              colors={["#2E7D32"]}
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="document-text-outline" size={64} color="#9E9E9E" />
          </View>

          <Text style={styles.emptyTitle}>No History Found</Text>
          <Text style={styles.emptyDescription}>
            No fertilizer predictions are available for {selectedFilter.toLowerCase()}.
          </Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.fab}
        onPress={() => router.push("/fertilizer-management/select")}
      >
        <LinearGradient
          colors={["#2E7D32", "#1B5E20"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  refreshButton: {
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1B5E20",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
    marginTop: 2,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterScrollContent: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterPillActive: {
    backgroundColor: "#2E7D32",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4E6E4E",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 10,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    color: "#4E6E4E",
    fontWeight: "700",
  },
  timeText: {
    fontSize: 11,
    color: "#7A8F7A",
    fontWeight: "500",
    marginTop: 1,
  },
  fertilizerBadge: {
    maxWidth: 150,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
    backgroundColor: "#E8F5E9",
  },
  fertilizerBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2E7D32",
  },
  recommendationBox: {
    backgroundColor: "#F1F8E9",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DCEFD3",
  },
  recommendationLabel: {
    fontSize: 12,
    color: "#4E6E4E",
    fontWeight: "700",
    marginBottom: 4,
  },
  recommendationValue: {
    fontSize: 20,
    color: "#1B5E20",
    fontWeight: "900",
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: "#4E6E4E",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: "#1B5E20",
    fontWeight: "700",
    marginTop: 2,
  },
  sensorRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F8F9FA",
    padding: 10,
    borderRadius: 12,
    gap: 8,
  },
  sensorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },
  sensorText: {
    fontSize: 13,
    color: "#4E6E4E",
    fontWeight: "600",
  },
  npkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  npkLabel: {
    fontSize: 13,
    color: "#4E6E4E",
    fontWeight: "600",
  },
  npkBadges: {
    flexDirection: "row",
    gap: 6,
  },
  npkBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  npkBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "700",
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#4E6E4E",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 18,
    backgroundColor: "#2E7D32",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    borderRadius: 30,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});