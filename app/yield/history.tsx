import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const API_BASE_URL = "http://192.168.1.35:8000";

const soilTextureMap: Record<string, number> = {
  Loamy: 1,
  Sandy: 2,
  Clay: 3,
};

type FarmConfig = {
  farmName?: string;
  plantCount?: number;
  soilType?: string;
  plantingDate?: string;
};

type ForecastPoint = {
  label: string;
  dateISO: string;
  gelWeightG: number;
};

// ─── Animated Bar ─────────────────────────────────────────────────────────────
function AnimatedBar({
  item,
  maxYield,
  peakValue,
  index,
  total,
}: {
  item: ForecastPoint;
  maxYield: number;
  peakValue: number;
  index: number;
  total: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const isPeak = item.gelWeightG === peakValue;
  const targetHeight = Math.max((item.gelWeightG / maxYield) * 120, 8);

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 40,
      useNativeDriver: false,
    }).start();
  }, [item.gelWeightG, maxYield]);

  const animatedHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, targetHeight],
  });

  const showLabel = total <= 7;

  return (
    <View style={barStyles.col}>
      {showLabel && (
        <Text style={[barStyles.val, isPeak && barStyles.valPeak]}>
          {item.gelWeightG.toFixed(1)}
        </Text>
      )}
      <View style={barStyles.barWrapper}>
        <Animated.View
          style={{ height: animatedHeight, width: "100%", borderRadius: 6, overflow: "hidden" }}
        >
          <LinearGradient
            colors={isPeak ? ["#4CAF50", "#2E7D32"] : ["#A5D6A7", "#81C784"]}
            style={StyleSheet.absoluteFill}
          />
          {isPeak && <View style={barStyles.peakDot} />}
        </Animated.View>
      </View>
      <Text style={[barStyles.label, isPeak && barStyles.labelPeak]}>{item.label}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  col: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingHorizontal: 1,
  },
  val: { fontSize: 8, fontWeight: "700", color: "#4E6E4E", textAlign: "center" },
  valPeak: { color: "#2E7D32" },
  barWrapper: { width: "100%", alignItems: "center", justifyContent: "flex-end", height: 120 },
  label: { fontSize: 9, color: "#9E9E9E", fontWeight: "600", textAlign: "center" },
  labelPeak: { color: "#2E7D32", fontWeight: "700" },
  peakDot: {
    position: "absolute",
    top: 4,
    alignSelf: "center",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function YieldHistoryScreen() {
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");
  const [plantCount, setPlantCount] = useState<number>(0);
  const [plantAgeMonths, setPlantAgeMonths] = useState<number>(1);
  const [soilTextureEnc, setSoilTextureEnc] = useState<number>(1);

  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadFarmSetup = async () => {
    try {
      const data = await AsyncStorage.getItem("farmConfig");
      if (!data) {
        setError("Farm setup not found. Please configure your farm first.");
        return;
      }
      const parsed: FarmConfig = JSON.parse(data);
      const count = Number(parsed.plantCount ?? 0);
      const soilType = parsed.soilType ?? "Loamy";
      let diffMonths = 1;
      if (parsed.plantingDate) {
        const plantingDate = new Date(parsed.plantingDate);
        const today = new Date();
        diffMonths =
          (today.getFullYear() - plantingDate.getFullYear()) * 12 +
          (today.getMonth() - plantingDate.getMonth());
      }
      setPlantCount(count);
      setPlantAgeMonths(Math.max(1, diffMonths));
      setSoilTextureEnc(soilTextureMap[soilType] ?? 1);
      setError("");
    } catch {
      setError("Failed to load farm configuration.");
    }
  };

  const buildForecastTargets = () => {
    const count = timeRange === "week" ? 7 : 30;
    return Array.from({ length: count }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      const label =
        timeRange === "week"
          ? d.toLocaleDateString("en-US", { weekday: "short" })
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const naiveTimestamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T12:00:00`;
      return { label, target_timestamp: naiveTimestamp };
    });
  };

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError("");
      const targets = buildForecastTargets();
      const responses = await Promise.all(
        targets.map(async (target) => {
          const payload = {
            target_timestamp: target.target_timestamp,
            soil_ph: 6.5,
            soil_organic_matter_pct: 2.8,
            soil_moisture_pct: 38,
            irrigation_mm: 4,
            plant_age_months: plantAgeMonths,
            soil_texture_enc: soilTextureEnc,
          };
          const response = await fetch(`${API_BASE_URL}/yield/predict-future`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const rawText = await response.text();
          if (!response.ok) throw new Error(`Forecast failed: ${response.status}`);
          const data = rawText ? JSON.parse(rawText) : null;
          return {
            label: target.label,
            dateISO: target.target_timestamp,
            gelWeightG: Number(data?.gel_weight_g ?? 0),
          } as ForecastPoint;
        })
      );
      setForecastData(responses);
    } catch (err: any) {
      setError(err?.message || "Failed to load forecast data.");
      setForecastData([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadFarmSetup(); }, []));

  useEffect(() => {
    if (plantAgeMonths > 0) fetchForecast();
  }, [plantAgeMonths, soilTextureEnc, timeRange]);

  const stats = useMemo(() => {
    if (!forecastData.length) return { avg: "0.0", max: 0, min: 0, avgTotalKg: "0.00" };
    const values = forecastData.map((d) => d.gelWeightG);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      avg: avg.toFixed(1),
      max: Math.max(...values),
      min: Math.min(...values),
      avgTotalKg: ((avg * plantCount) / 1000).toFixed(2),
    };
  }, [forecastData, plantCount]);

  const maxYield = useMemo(
    () => Math.max(...forecastData.map((d) => d.gelWeightG), 1),
    [forecastData]
  );
  const peakValue = useMemo(() => stats.max, [stats]);

  const trend = useMemo(() => {
    if (!forecastData.length) return null;
    const diff =
      forecastData[forecastData.length - 1].gelWeightG - forecastData[0].gelWeightG;
    if (diff > 0.5)
      return { label: "Improving", icon: "trending-up" as const, color: "#4CAF50", bg: "#E8F5E9" };
    if (diff < -0.5)
      return { label: "Declining", icon: "trending-down" as const, color: "#F44336", bg: "#FFEBEE" };
    return { label: "Stable", icon: "remove" as const, color: "#FF9800", bg: "#FFF3E0" };
  }, [forecastData]);

  const insightText = useMemo(() => {
    if (!forecastData.length) return "No forecast available yet.";
    const diff =
      forecastData[forecastData.length - 1].gelWeightG - forecastData[0].gelWeightG;
    if (diff > 0.5)
      return `Yield is trending upward — peak of ${stats.max.toFixed(1)}g expected. Optimal harvest window approaching.`;
    if (diff < -0.5)
      return `A slight decline of ${Math.abs(diff).toFixed(1)}g is forecasted. Consider reviewing irrigation and soil moisture.`;
    return `Forecast remains stable around ${stats.avg}g per plant across the selected period.`;
  }, [forecastData, stats]);

  return (
    <LinearGradient colors={["#E8F5E9", "#F1F8E9", "#FFFFFF"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerIconWrapper}>
              <MaterialCommunityIcons name="chart-timeline-variant" size={28} color="#2E7D32" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Yield Forecast</Text>
              <Text style={styles.subtitle}>Future prediction using ML forecasting</Text>
            </View>
          </View>

          <View style={styles.statusBanner}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>ML Model: Active</Text>
            </View>
            <View style={styles.pillRow}>
              <View style={styles.infoPill}>
                <Ionicons name="leaf-outline" size={12} color="#4CAF50" />
                <Text style={styles.infoPillText}>{plantCount} plants</Text>
              </View>
              <View style={styles.infoPill}>
                <Ionicons name="time-outline" size={12} color="#FF9800" />
                <Text style={styles.infoPillText}>{plantAgeMonths}mo</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Toggle ── */}
        <Animated.View
          style={[styles.toggle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <TouchableOpacity
            style={[styles.toggleBtn, timeRange === "week" && styles.toggleActive]}
            onPress={() => setTimeRange("week")}
          >
            {timeRange === "week" && (
              <LinearGradient
                colors={["#2E7D32", "#1B5E20"]}
                style={StyleSheet.absoluteFill}
                borderRadius={10}
              />
            )}
            <Text style={[styles.toggleText, timeRange === "week" && styles.toggleTextActive]}>
              7 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, timeRange === "month" && styles.toggleActive]}
            onPress={() => setTimeRange("month")}
          >
            {timeRange === "month" && (
              <LinearGradient
                colors={["#2E7D32", "#1B5E20"]}
                style={StyleSheet.absoluteFill}
                borderRadius={10}
              />
            )}
            <Text style={[styles.toggleText, timeRange === "month" && styles.toggleTextActive]}>
              30 Days
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Stats Grid ── */}
        <Animated.View
          style={[styles.statsGrid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="leaf-outline" size={22} color="#4CAF50" />
            </View>
            <Text style={styles.statLabel}>AVG / PLANT</Text>
            <Text style={styles.statValue}>{stats.avg}</Text>
            <Text style={styles.statSubtext}>grams</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="trending-up-outline" size={22} color="#2E7D32" />
            </View>
            <Text style={styles.statLabel}>PEAK</Text>
            <Text style={styles.statValue}>{stats.max.toFixed(1)}</Text>
            <Text style={styles.statSubtext}>grams</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E3F2FD" }]}>
              <MaterialCommunityIcons name="scale" size={22} color="#2196F3" />
            </View>
            <Text style={styles.statLabel}>FARM AVG</Text>
            <Text style={styles.statValue}>{stats.avgTotalKg}</Text>
            <Text style={styles.statSubtext}>kg total</Text>
          </View>
        </Animated.View>

        {/* ── Trend Badge ── */}
        {trend && (
          <Animated.View
            style={[styles.trendRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <View style={[styles.trendPill, { backgroundColor: trend.bg }]}>
              <Ionicons name={trend.icon} size={14} color={trend.color} />
              <Text style={[styles.trendText, { color: trend.color }]}>{trend.label}</Text>
            </View>
            <Text style={styles.trendNote}>Trend across selected period</Text>
          </Animated.View>
        )}

        {/* ── Chart Card ── */}
        <Animated.View
          style={[styles.chartCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.chartHeaderRow}>
            <View>
              <Text style={styles.chartTitle}>Forecast Trend</Text>
              <Text style={styles.chartSub}>Predicted gel weight per plant (g)</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>gel (g)</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>Calculating forecast…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <View style={[styles.statIcon, { backgroundColor: "#FFEBEE" }]}>
                <Ionicons name="alert-circle-outline" size={24} color="#F44336" />
              </View>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.barsContainer}>
              {forecastData.map((d, i) => (
                <AnimatedBar
                  key={`${d.dateISO}-${timeRange}`}
                  item={d}
                  maxYield={maxYield}
                  peakValue={peakValue}
                  index={i}
                  total={forecastData.length}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {/* ── Insights Card ── */}
        <Animated.View
          style={[styles.insightsCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.insightsHeader}>
            <View style={styles.insightsIconWrapper}>
              <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FF9800" />
            </View>
            <Text style={styles.insightsTitle}>Forecast Insight</Text>
          </View>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>{insightText}</Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                Peak yield of {stats.max.toFixed(1)}g expected — plan harvest window accordingly.
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                Farm-wide average estimated at {stats.avgTotalKg} kg across {plantCount} plants.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Hero Total Card ── */}
        <Animated.View
          style={[styles.mainCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <LinearGradient
            colors={["#2E7D32", "#1B5E20"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCardGradient}
          >
            <View style={styles.mainCardHeader}>
              <View style={styles.mainCardIconWrapper}>
                <MaterialCommunityIcons name="chart-bell-curve" size={26} color="#FFFFFF" />
              </View>
              <Text style={styles.mainLabel}>Avg Farm Forecast</Text>
            </View>
            <Text style={styles.mainValue}>{stats.avgTotalKg} kg</Text>
            <View style={styles.mainCardFooter}>
              <Ionicons name="information-circle" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.mainNote}>
                Based on {forecastData.length} predicted data points
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Breakdown List ── */}
        <Animated.View
          style={[styles.listCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.listHeaderRow}>
            <View style={[styles.insightsIconWrapper, { backgroundColor: "#E8F5E9" }]}>
              <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#2E7D32" />
            </View>
            <View>
              <Text style={styles.insightsTitle}>Forecast Breakdown</Text>
              <Text style={styles.chartSub}>{forecastData.length} data points</Text>
            </View>
          </View>

          <View style={styles.listDivider} />

          {forecastData.map((item, i) => {
            const totalKg = ((item.gelWeightG * plantCount) / 1000).toFixed(2);
            const barPct = (item.gelWeightG / maxYield) * 100;
            const isPeak = item.gelWeightG === peakValue;

            return (
              <View
                key={item.dateISO}
                style={[
                  styles.listRow,
                  i === forecastData.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.listDayRow}>
                    <Text style={styles.listDay}>{item.label}</Text>
                    {isPeak && (
                      <View style={styles.peakBadge}>
                        <Text style={styles.peakBadgeText}>Peak</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.listDate}>
                    {new Date(item.dateISO).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                  <View style={styles.miniBarBg}>
                    <LinearGradient
                      colors={isPeak ? ["#4CAF50", "#2E7D32"] : ["#C8E6C9", "#A5D6A7"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.miniBarFill, { width: `${barPct}%` }]}
                    />
                  </View>
                </View>
                <View style={styles.listRight}>
                  <Text style={[styles.listWeight, isPeak && { color: "#2E7D32" }]}>
                    {item.gelWeightG.toFixed(2)}g
                  </Text>
                  <Text style={styles.listTotal}>{totalKg} kg</Text>
                </View>
              </View>
            );
          })}
        </Animated.View>

        {/* ── Footer ── */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={16} color="#9E9E9E" />
          <Text style={styles.footerText}>
            Forecast values are generated from the trained yield model using future target
            timestamps and current farm conditions. Predictions only — not guaranteed outcomes.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  // Header
  header: { marginBottom: 20 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
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
  headerTextContainer: { flex: 1 },
  title: { fontSize: 26, fontWeight: "800", color: "#1B5E20" },
  subtitle: { fontSize: 14, color: "#4E6E4E", fontWeight: "500" },
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
  statusIndicator: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4CAF50" },
  statusText: { fontSize: 14, fontWeight: "600", color: "#2E7D32" },
  pillRow: { flexDirection: "row", gap: 6 },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F8E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  infoPillText: { fontSize: 11, fontWeight: "600", color: "#4E6E4E" },

  // Toggle
  toggle: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center", overflow: "hidden" },
  toggleActive: {},
  toggleText: { fontSize: 13, fontWeight: "600", color: "#9E9E9E" },
  toggleTextActive: { color: "#FFFFFF" },

  // Stats Grid
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  statLabel: { fontSize: 9, color: "#9E9E9E", fontWeight: "700", letterSpacing: 0.8, marginBottom: 4, textAlign: "center" },
  statValue: { fontSize: 22, fontWeight: "800", color: "#1B5E20", marginBottom: 2, letterSpacing: -0.5 },
  statSubtext: { fontSize: 10, color: "#BDBDBD", fontWeight: "500" },

  // Trend
  trendRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  trendPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100 },
  trendText: { fontSize: 12, fontWeight: "700" },
  trendNote: { fontSize: 12, color: "#9E9E9E", fontWeight: "500" },

  // Chart Card
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  chartHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  chartTitle: { fontSize: 16, fontWeight: "700", color: "#1B5E20" },
  chartSub: { fontSize: 12, color: "#9E9E9E", marginTop: 3, marginBottom: 16, fontWeight: "400" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#4CAF50" },
  legendText: { fontSize: 11, color: "#9E9E9E", fontWeight: "500" },
  barsContainer: { flexDirection: "row", alignItems: "flex-end", height: 168, paddingTop: 24 },
  loadingBox: { height: 140, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 13, color: "#4E6E4E", fontWeight: "500" },
  errorBox: { height: 120, justifyContent: "center", alignItems: "center", gap: 10 },
  errorText: { fontSize: 13, color: "#F44336", textAlign: "center", lineHeight: 20 },

  // Main Hero Card
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
  mainCardGradient: { padding: 24 },
  mainCardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  mainCardIconWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  mainLabel: { fontSize: 16, color: "rgba(255,255,255,0.9)", fontWeight: "600" },
  mainValue: { fontSize: 52, fontWeight: "800", color: "#FFFFFF", marginBottom: 12, letterSpacing: -2 },
  mainCardFooter: { flexDirection: "row", alignItems: "center", gap: 6 },
  mainNote: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "500" },

  // Insights Card
  insightsCard: {
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
  insightsHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  insightsIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center" },
  insightsTitle: { fontSize: 16, fontWeight: "700", color: "#1B5E20" },
  insightsList: { gap: 12 },
  insightItem: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  insightDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF9800", marginTop: 7 },
  insightText: { flex: 1, fontSize: 14, color: "#4E6E4E", lineHeight: 20 },

  // List Card
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  listDivider: { height: 1, backgroundColor: "#F5F5F5", marginBottom: 4 },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    gap: 12,
  },
  listDayRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  listDay: { fontSize: 14, fontWeight: "700", color: "#1B5E20" },
  listDate: { fontSize: 11, color: "#9E9E9E", fontWeight: "500", marginBottom: 6 },
  miniBarBg: { height: 4, backgroundColor: "#F1F8E9", borderRadius: 2, width: "85%", overflow: "hidden" },
  miniBarFill: { height: "100%", borderRadius: 2 },
  listRight: { alignItems: "flex-end", flexShrink: 0 },
  listWeight: { fontSize: 15, fontWeight: "800", color: "#4CAF50", letterSpacing: -0.3 },
  listTotal: { fontSize: 11, color: "#9E9E9E", marginTop: 3 },
  peakBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: "#E8F5E9" },
  peakBadgeText: { fontSize: 9, fontWeight: "700", color: "#2E7D32", letterSpacing: 0.5 },

  // Footer
  footerNote: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "#F5F5F5", padding: 14, borderRadius: 12 },
  footerText: { flex: 1, fontSize: 12, color: "#9E9E9E", lineHeight: 18, fontWeight: "400" },
});