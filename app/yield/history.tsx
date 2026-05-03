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
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLanguage } from "../../context/LanguageContext";
import { BASE_URL } from "../../config/api";

const { width } = Dimensions.get("window");

const API_BASE_URL = BASE_URL;

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

export default function YieldHistoryScreen() {
  const { t, language } = useLanguage();

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
        setError(t("farmSetupNotFound"));
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
      setError(t("failedToLoadFarmConfig"));
    }
  };

  const buildForecastTargets = () => {
    const count = timeRange === "week" ? 7 : 30;
    return Array.from({ length: count }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      const label =
        timeRange === "week"
          ? d.toLocaleDateString(language === "si" ? "si-LK" : "en-US", { weekday: "short" })
          : d.toLocaleDateString(language === "si" ? "si-LK" : "en-US", {
              month: "short",
              day: "numeric",
            });
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
      setError(err?.message || t("failedToLoadForecastData"));
      setForecastData([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFarmSetup();
    }, [t])
  );

  useEffect(() => {
    if (plantAgeMonths > 0) fetchForecast();
  }, [plantAgeMonths, soilTextureEnc, timeRange, language]);

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

  const peakValue = useMemo(() => stats.max, [stats]);

  const trend = useMemo(() => {
    if (!forecastData.length) return null;
    const diff =
      forecastData[forecastData.length - 1].gelWeightG - forecastData[0].gelWeightG;
    if (diff > 0.5)
      return {
        label: t("improving"),
        icon: "trending-up" as const,
        color: "#4CAF50",
        bg: "#E8F5E9",
      };
    if (diff < -0.5)
      return {
        label: t("declining"),
        icon: "trending-down" as const,
        color: "#F44336",
        bg: "#FFEBEE",
      };
    return {
      label: t("stable"),
      icon: "remove" as const,
      color: "#FF9800",
      bg: "#FFF3E0",
    };
  }, [forecastData, t]);

  const insightText = useMemo(() => {
    if (!forecastData.length) return t("noForecastAvailableYet");
    const diff =
      forecastData[forecastData.length - 1].gelWeightG - forecastData[0].gelWeightG;
    if (diff > 0.5)
      return `${t("yieldTrendingUpward")} ${stats.max.toFixed(1)}g ${t("expectedOptimalHarvestApproaching")}`;
    if (diff < -0.5)
      return `${t("slightDeclineForecasted")} ${Math.abs(diff).toFixed(1)}g ${t("reviewIrrigationSoilMoisture")}`;
    return `${t("forecastStableAround")} ${stats.avg}g ${t("perPlantAcrossSelectedPeriod")}`;
  }, [forecastData, stats, t]);

  // ─── Chart helpers ──────────────────────────────────────────────
  const CHART_WIDTH = width - 64; // card padding 20 * 2 + screen padding 12 * 2

  /**
   * For 30-day view, only show every 5th label so the x-axis isn't crowded.
   * react-native-chart-kit always renders every label, so we blank the others.
   */
  const chartLabels = useMemo(() => {
    if (!forecastData.length) return [];
    if (timeRange === "week") return forecastData.map((d) => d.label);
    return forecastData.map((d, i) => (i % 5 === 0 ? d.label : ""));
  }, [forecastData, timeRange]);

  const chartValues = useMemo(
    () => (forecastData.length ? forecastData.map((d) => d.gelWeightG) : [0]),
    [forecastData]
  );

  const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,   // line colour
    labelColor: () => "#9E9E9E",
    strokeWidth: 2.5,
    propsForDots: {
      r: timeRange === "week" ? "5" : "3",
      strokeWidth: "2",
      stroke: "#FFFFFF",
    },
    propsForBackgroundLines: {
      strokeDasharray: "4 4",
      stroke: "rgba(0,0,0,0.06)",
      strokeWidth: 1,
    },
  };

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
              <Text style={styles.title}>{t("yieldForecast")}</Text>
              <Text style={styles.subtitle}>{t("futurePredictionUsingMlForecasting")}</Text>
            </View>
          </View>

          <View style={styles.statusBanner}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{t("mlModelActive")}</Text>
            </View>
            <View style={styles.pillRow}>
              <View style={styles.infoPill}>
                <Ionicons name="leaf-outline" size={12} color="#4CAF50" />
                <Text style={styles.infoPillText}>{plantCount} {t("plants")}</Text>
              </View>
              <View style={styles.infoPill}>
                <Ionicons name="time-outline" size={12} color="#FF9800" />
                <Text style={styles.infoPillText}>{plantAgeMonths}{t("monthsShort")}</Text>
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
              {t("sevenDays")}
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
              {t("thirtyDays")}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Stat cards ── */}
        <Animated.View
          style={[styles.statsGrid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="leaf-outline" size={22} color="#4CAF50" />
            </View>
            <Text style={styles.statLabel}>{t("avgPerPlant")}</Text>
            <Text style={styles.statValue}>{stats.avg}</Text>
            <Text style={styles.statSubtext}>{t("grams")}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="trending-up-outline" size={22} color="#2E7D32" />
            </View>
            <Text style={styles.statLabel}>{t("peak")}</Text>
            <Text style={styles.statValue}>{stats.max.toFixed(1)}</Text>
            <Text style={styles.statSubtext}>{t("grams")}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E3F2FD" }]}>
              <MaterialCommunityIcons name="scale" size={22} color="#2196F3" />
            </View>
            <Text style={styles.statLabel}>{t("farmAverage")}</Text>
            <Text style={styles.statValue}>{stats.avgTotalKg}</Text>
            <Text style={styles.statSubtext}>{t("kgTotal")}</Text>
          </View>
        </Animated.View>

        {/* ── Trend pill ── */}
        {trend && (
          <Animated.View
            style={[styles.trendRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <View style={[styles.trendPill, { backgroundColor: trend.bg }]}>
              <Ionicons name={trend.icon} size={14} color={trend.color} />
              <Text style={[styles.trendText, { color: trend.color }]}>{trend.label}</Text>
            </View>
            <Text style={styles.trendNote}>{t("trendAcrossSelectedPeriod")}</Text>
          </Animated.View>
        )}

        {/* ── LINE CHART CARD ── */}
        <Animated.View
          style={[styles.chartCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          {/* Header row */}
          <View style={styles.chartHeaderRow}>
            <View>
              <Text style={styles.chartTitle}>{t("forecastTrend")}</Text>
              <Text style={styles.chartSub}>{t("predictedGelWeightPerPlant")}</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendLine} />
              <Text style={styles.legendText}>{t("gelShort")}</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>{t("calculatingForecast")}</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <View style={[styles.statIcon, { backgroundColor: "#FFEBEE" }]}>
                <Ionicons name="alert-circle-outline" size={24} color="#F44336" />
              </View>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : forecastData.length > 0 ? (
            <View style={styles.lineChartWrapper}>
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [
                    {
                      data: chartValues,
                      color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                      strokeWidth: 2.5,
                    },
                  ],
                }}
                width={CHART_WIDTH}
                height={220}
                chartConfig={chartConfig}
                bezier
                withInnerLines
                withOuterLines={false}
                withShadow={false}
                withDots
                withVerticalLabels
                withHorizontalLabels
                yAxisSuffix="g"
                fromZero={false}
                style={styles.lineChart}
                getDotColor={(dataPoint) =>
                  dataPoint === peakValue ? "#1B5E20" : "#4CAF50"
                }
                renderDotContent={({ x, y, index, indexData }) => {
                  if (indexData !== peakValue) return null;
                  return (
                    <View
                      key={index}
                      style={[styles.peakLabel, { left: x - 18, top: y - 26 }]}
                    >
                      <Text style={styles.peakLabelText}>
                        {indexData.toFixed(1)}g
                      </Text>
                    </View>
                  );
                }}
              />
            </View>
          ) : null}

          {/* Y-axis hint */}
          {!loading && !error && forecastData.length > 0 && (
            <View style={styles.chartFooterRow}>
              <View style={styles.chartFooterDot} />
              <Text style={styles.chartFooterNote}>
                {t("peak")}: {stats.max.toFixed(1)}g &nbsp;·&nbsp; {t("min")}: {stats.min.toFixed(1)}g
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ── Insights card ── */}
        <Animated.View
          style={[styles.insightsCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.insightsHeader}>
            <View style={styles.insightsIconWrapper}>
              <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FF9800" />
            </View>
            <Text style={styles.insightsTitle}>{t("forecastInsight")}</Text>
          </View>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>{insightText}</Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                {t("peakYieldOf")} {stats.max.toFixed(1)}g {t("expectedPlanHarvestWindow")}
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                {t("farmWideAverageEstimatedAt")} {stats.avgTotalKg} kg {t("across")} {plantCount} {t("plants")}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Big KPI card ── */}
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
              <Text style={styles.mainLabel}>{t("avgFarmForecast")}</Text>
            </View>
            <Text style={styles.mainValue}>{stats.avgTotalKg} kg</Text>
            <View style={styles.mainCardFooter}>
              <Ionicons name="information-circle" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.mainNote}>
                {t("basedOnPredictedDataPoints")} {forecastData.length}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Breakdown list ── */}
        <Animated.View
          style={[styles.listCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.listHeaderRow}>
            <View style={[styles.insightsIconWrapper, { backgroundColor: "#E8F5E9" }]}>
              <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#2E7D32" />
            </View>
            <View>
              <Text style={styles.insightsTitle}>{t("forecastBreakdown")}</Text>
              <Text style={styles.chartSub}>{forecastData.length} {t("dataPoints")}</Text>
            </View>
          </View>

          <View style={styles.listDivider} />

          {forecastData.map((item, i) => {
            const totalKg = ((item.gelWeightG * plantCount) / 1000).toFixed(2);
            const maxYield = Math.max(...forecastData.map((d) => d.gelWeightG), 1);
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
                        <Text style={styles.peakBadgeText}>{t("peak")}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.listDate}>
                    {new Date(item.dateISO).toLocaleDateString(
                      language === "si" ? "si-LK" : "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
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

        {/* ── Footer note ── */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={16} color="#9E9E9E" />
          <Text style={styles.footerText}>{t("forecastFooterNote")}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  // ── Header
  header: { marginBottom: 20 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  headerIconWrapper: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#2E7D32", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  headerTextContainer: { flex: 1 },
  title: { fontSize: 26, fontWeight: "800", color: "#1B5E20" },
  subtitle: { fontSize: 14, color: "#4E6E4E", fontWeight: "500" },
  statusBanner: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#FFFFFF", padding: 14, borderRadius: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  statusIndicator: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4CAF50" },
  statusText: { fontSize: 14, fontWeight: "600", color: "#2E7D32" },
  pillRow: { flexDirection: "row", gap: 6 },
  infoPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#F1F8E9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  infoPillText: { fontSize: 11, fontWeight: "600", color: "#4E6E4E" },

  // ── Toggle
  toggle: {
    flexDirection: "row", backgroundColor: "#FFFFFF",
    borderRadius: 14, padding: 4, marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  toggleBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center", overflow: "hidden" },
  toggleActive: {},
  toggleText: { fontSize: 13, fontWeight: "600", color: "#9E9E9E" },
  toggleTextActive: { color: "#FFFFFF" },

  // ── Stats grid
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14,
    alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  statIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center", marginBottom: 10,
  },
  statLabel: {
    fontSize: 9, color: "#9E9E9E", fontWeight: "700",
    letterSpacing: 0.8, marginBottom: 4, textAlign: "center",
  },
  statValue: { fontSize: 22, fontWeight: "800", color: "#1B5E20", marginBottom: 2, letterSpacing: -0.5 },
  statSubtext: { fontSize: 10, color: "#BDBDBD", fontWeight: "500" },

  // ── Trend row
  trendRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  trendPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100,
  },
  trendText: { fontSize: 12, fontWeight: "700" },
  trendNote: { fontSize: 12, color: "#9E9E9E", fontWeight: "500" },

  // ── Chart card (line chart)
  chartCard: {
    backgroundColor: "#FFFFFF", borderRadius: 24,
    paddingTop: 20, paddingHorizontal: 20, paddingBottom: 16,
    marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
  },
  chartHeaderRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 4,
  },
  chartTitle: { fontSize: 16, fontWeight: "700", color: "#1B5E20" },
  chartSub: { fontSize: 12, color: "#9E9E9E", marginTop: 3, marginBottom: 16, fontWeight: "400" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  legendLine: {
    width: 18, height: 3, borderRadius: 2,
    backgroundColor: "#4CAF50",
  },
  legendText: { fontSize: 11, color: "#9E9E9E", fontWeight: "500" },

  lineChartWrapper: {
    marginLeft: -20,   // bleed to card edge so axis labels aren't clipped
    marginRight: -20,
    marginBottom: 4,
  },
  lineChart: {
    borderRadius: 0,
  },

  // Peak label rendered above the peak dot
  peakLabel: {
    position: "absolute",
    backgroundColor: "#1B5E20",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  peakLabelText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  chartFooterRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 8, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: "#F5F5F5",
  },
  chartFooterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4CAF50" },
  chartFooterNote: { fontSize: 11, color: "#9E9E9E", fontWeight: "500" },

  loadingBox: { height: 140, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 13, color: "#4E6E4E", fontWeight: "500" },
  errorBox: { height: 120, justifyContent: "center", alignItems: "center", gap: 10 },
  errorText: { fontSize: 13, color: "#F44336", textAlign: "center", lineHeight: 20 },

  // ── Big KPI card
  mainCard: {
    marginBottom: 20, borderRadius: 24, overflow: "hidden",
    shadowColor: "#2E7D32", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  mainCardGradient: { padding: 24 },
  mainCardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  mainCardIconWrapper: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  mainLabel: { fontSize: 16, color: "rgba(255,255,255,0.9)", fontWeight: "600" },
  mainValue: { fontSize: 52, fontWeight: "800", color: "#FFFFFF", marginBottom: 12, letterSpacing: -2 },
  mainCardFooter: { flexDirection: "row", alignItems: "center", gap: 6 },
  mainNote: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "500" },

  // ── Insights card
  insightsCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  insightsHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  insightsIconWrapper: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center",
  },
  insightsTitle: { fontSize: 16, fontWeight: "700", color: "#1B5E20" },
  insightsList: { gap: 12 },
  insightItem: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  insightDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF9800", marginTop: 7 },
  insightText: { flex: 1, fontSize: 14, color: "#4E6E4E", lineHeight: 20 },

  // ── Breakdown list
  listCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 18, marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  listHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  listDivider: { height: 1, backgroundColor: "#F5F5F5", marginBottom: 4 },
  listRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5", gap: 12,
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

  // ── Footer
  footerNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#F5F5F5", padding: 14, borderRadius: 12,
  },
  footerText: { flex: 1, fontSize: 12, color: "#9E9E9E", lineHeight: 18, fontWeight: "400" },
});