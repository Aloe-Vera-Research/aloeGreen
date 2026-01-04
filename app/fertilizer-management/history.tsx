import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// Mock data for past fertilizer plans
const mockPlans = [
  {
    id: "1",
    date: "2025-01-02",
    soilType: "Loam",
    plantStage: "Mature",
    status: "Active",
    npk: { n: "Medium", p: "Low", k: "High" },
    temperature: "29°C",
    moisture: "42%",
    ph: "6.5",
  },
  {
    id: "2",
    date: "2024-12-28",
    soilType: "Sandy",
    plantStage: "Baby",
    status: "Completed",
    npk: { n: "Low", p: "Medium", k: "Medium" },
    temperature: "27°C",
    moisture: "38%",
    ph: "6.2",
  },
  {
    id: "3",
    date: "2024-12-15",
    soilType: "Clay",
    plantStage: "Damage Recovery",
    status: "Completed",
    npk: { n: "High", p: "Low", k: "Medium" },
    temperature: "28°C",
    moisture: "45%",
    ph: "6.8",
  },
  {
    id: "4",
    date: "2024-12-01",
    soilType: "Loam",
    plantStage: "Baby",
    status: "Completed",
    npk: { n: "Medium", p: "Medium", k: "Low" },
    temperature: "26°C",
    moisture: "40%",
    ph: "6.4",
  },
];

export default function FertilizerHistory() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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

  const filters = ["All", "Active", "Completed"];

  const filteredPlans =
    selectedFilter === "All"
      ? mockPlans
      : mockPlans.filter((plan) => plan.status === selectedFilter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

  const renderPlanCard = ({ item, index }: { item: typeof mockPlans[0]; index: number }) => (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 30 + index * 10],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.planCard}
        onPress={() => {
          router.push({
            pathname: "/fertilizer-management/plan",
            params: {
              soil: item.soilType,
              stage: item.plantStage,
              temperature: item.temperature,
              moisture: item.moisture,
              soilPH: item.ph,
              N: item.npk.n,
              P: item.npk.p,
              K: item.npk.k,
              fromHistory: "true",
            },
          });
        }}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#4E6E4E" />
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "Active" ? "#E8F5E9" : "#F5F5F5",
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    item.status === "Active" ? "#4CAF50" : "#9E9E9E",
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: item.status === "Active" ? "#2E7D32" : "#616161",
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* Main Info */}
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="layers-outline" size={20} color="#2E7D32" />
              </View>
              <View>
                <Text style={styles.infoLabel}>Soil Type</Text>
                <Text style={styles.infoValue}>{item.soilType}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="analytics-outline" size={20} color="#2E7D32" />
              </View>
              <View>
                <Text style={styles.infoLabel}>Plant Stage</Text>
                <Text style={styles.infoValue}>{item.plantStage}</Text>
              </View>
            </View>
          </View>

          {/* Sensor Data Row */}
          <View style={styles.sensorRow}>
            <View style={styles.sensorItem}>
              <Ionicons name="thermometer-outline" size={16} color="#4E6E4E" />
              <Text style={styles.sensorText}>{item.temperature}</Text>
            </View>
            <View style={styles.sensorItem}>
              <Ionicons name="water-outline" size={16} color="#4E6E4E" />
              <Text style={styles.sensorText}>{item.moisture}</Text>
            </View>
            <View style={styles.sensorItem}>
              <Ionicons name="beaker-outline" size={16} color="#4E6E4E" />
              <Text style={styles.sensorText}>pH {item.ph}</Text>
            </View>
          </View>

          {/* NPK Levels */}
          <View style={styles.npkRow}>
            <Text style={styles.npkLabel}>NPK Levels:</Text>
            <View style={styles.npkBadges}>
              <View
                style={[
                  styles.npkBadge,
                  { backgroundColor: getNPKColor(item.npk.n) },
                ]}
              >
                <Text style={styles.npkBadgeText}>N: {item.npk.n}</Text>
              </View>
              <View
                style={[
                  styles.npkBadge,
                  { backgroundColor: getNPKColor(item.npk.p) },
                ]}
              >
                <Text style={styles.npkBadgeText}>P: {item.npk.p}</Text>
              </View>
              <View
                style={[
                  styles.npkBadge,
                  { backgroundColor: getNPKColor(item.npk.k) },
                ]}
              >
                <Text style={styles.npkBadgeText}>K: {item.npk.k}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* View Details Arrow */}
        <View style={styles.cardFooter}>
          <Text style={styles.viewDetailsText}>View Full Plan</Text>
          <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Plan History</Text>
          <Text style={styles.headerSubtitle}>
            {filteredPlans.length} plan{filteredPlans.length !== 1 ? "s" : ""} found
          </Text>
        </View>
      </View>

      {/* Filter Pills */}
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

      {/* Plans List */}
      {filteredPlans.length > 0 ? (
        <FlatList
          data={filteredPlans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="document-text-outline" size={64} color="#9E9E9E" />
          </View>
          <Text style={styles.emptyTitle}>No Plans Found</Text>
          <Text style={styles.emptyDescription}>
            No {selectedFilter.toLowerCase()} fertilizer plans available.
          </Text>
        </View>
      )}

      {/* Floating Action Button */}
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
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: "#4E6E4E",
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
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
  },
  sensorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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