import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../context/LanguageContext";
import { API_ENDPOINTS } from "../../config/api";

const screenWidth = Dimensions.get("window").width;
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

export default function AnalyzerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage();

  const [selectedPeriod, setSelectedPeriod] = useState("4W");
  const [history, setHistory] = useState<FertilizerHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const safeNumber = (value: any, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const fetchHistory = async () => {
    const response = await fetch(HISTORY_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(rawText || t("failedToLoadFertilizerHistory"));
    }

    let parsed: any = null;

    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
      throw new Error(t("backendReturnedInvalidJson"));
    }

    if (!parsed?.success) {
      throw new Error(parsed?.detail || t("failedToLoadFertilizerHistory"));
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
      setErrorMessage(error?.message || t("somethingWentWrong"));
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
      setErrorMessage(error?.message || t("somethingWentWrongRefreshing"));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();

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
    ]).start();
  }, []);

  const prediction = useMemo(() => {
    try {
      return params.prediction ? JSON.parse(String(params.prediction)) : null;
    } catch (error) {
      console.log("Analyzer prediction parse error:", error);
      return null;
    }
  }, [params.prediction]);

  const latestRecord = history?.[0];

  const hasRouteValues =
    params.N !== undefined ||
    params.P !== undefined ||
    params.K !== undefined ||
    params.soil !== undefined ||
    params.stage !== undefined;

  const currentInput = hasRouteValues
    ? {
        N: safeNumber(params.N),
        P: safeNumber(params.P),
        K: safeNumber(params.K),
        Soil_Type: String(params.soil ?? "Loamy"),
        Plant_Age_Category: String(params.stage ?? "Mature"),
      }
    : latestRecord?.input_data || {
        N: 0,
        P: 0,
        K: 0,
        Soil_Type: "Loamy",
        Plant_Age_Category: "Mature",
      };

  const latestPrediction =
    prediction?.data?.prediction ||
    prediction?.data ||
    latestRecord?.prediction_result ||
    {};

  const nValue = safeNumber(currentInput.N);
  const pValue = safeNumber(currentInput.P);
  const kValue = safeNumber(currentInput.K);
  const soilType = String(currentInput.Soil_Type ?? "Loamy");
  const stage = String(currentInput.Plant_Age_Category ?? "Mature");

  const chartWidth = screenWidth - 60;

  const filteredHistory = useMemo(() => {
    const now = new Date();

    const days =
      selectedPeriod === "1W"
        ? 7
        : selectedPeriod === "4W"
        ? 28
        : selectedPeriod === "3M"
        ? 90
        : 365;

    return history.filter((item) => {
      if (!item.created_at) return false;

      const createdDate = new Date(item.created_at);
      const diffTime = now.getTime() - createdDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      return diffDays <= days;
    });
  }, [history, selectedPeriod]);

  const trendRecords = useMemo(() => {
    const source = filteredHistory.length > 0 ? filteredHistory : history;
    return [...source].slice(0, 4).reverse();
  }, [filteredHistory, history]);

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const usageData = useMemo(() => {
    if (trendRecords.length > 0) {
      return {
        labels: trendRecords.map((item) => formatShortDate(item.created_at)),
        datasets: [
          {
            data: trendRecords.map((item) =>
              Math.max(
                1,
                safeNumber(
                  item.prediction_result?.recommended_dosage_g_per_plant,
                  0
                )
              )
            ),
            color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
            strokeWidth: 3,
          },
        ],
      };
    }

    return {
      labels: [t("week1"), t("week2"), t("week3"), t("week4")],
      datasets: [
        {
          data: [
            Math.max(10, Math.round(nValue * 0.25)),
            Math.max(10, Math.round((nValue + pValue) * 0.18)),
            Math.max(10, Math.round((pValue + kValue) * 0.15)),
            Math.max(10, Math.round((nValue + pValue + kValue) * 0.12)),
          ],
          color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  }, [trendRecords, nValue, pValue, kValue, t]);

  const npkData = {
    labels: [t("nitrogen"), t("phosphorus"), t("potassium")],
    datasets: [{ data: [nValue, pValue, kValue] }],
  };

  const totalUsage = filteredHistory.reduce((total, item) => {
    return (
      total +
      safeNumber(item.prediction_result?.recommended_dosage_g_per_plant, 0)
    );
  }, 0);

  const avgUsage =
    filteredHistory.length > 0
      ? Math.round(totalUsage / filteredHistory.length)
      : 0;

  const efficiency =
    nValue >= 30 && pValue >= 30 && kValue >= 30
      ? 90
      : nValue >= 20 && pValue >= 20 && kValue >= 20
      ? 78
      : 62;

  const stats = [
    {
      icon: "analytics",
      label: t("predictions"),
      value: `${filteredHistory.length}`,
      subtext: selectedPeriod,
      color: "#4CAF50",
    },
    {
      icon: "calendar",
      label: t("avgWeekly"),
      value: `${avgUsage}g`,
      subtext: t("perWeek"),
      color: "#2196F3",
    },
    {
      icon: "leaf",
      label: t("efficiency"),
      value: `${efficiency}%`,
      subtext: t("npkBased"),
      color: "#FF9800",
    },
    {
      icon: "flask",
      label: t("latest"),
      value: latestPrediction?.recommended_fertilizer || t("notAvailable"),
      subtext:
        latestPrediction?.recommended_dosage_g_per_plant !== undefined
          ? `${latestPrediction.recommended_dosage_g_per_plant}g / ${t(
              "perPlant"
            )}`
          : soilType,
      color: "#9C27B0",
    },
  ];

  const aiRecommendations =
    prediction?.insights ||
    [
      {
        week: t("nitrogenInsightTitle"),
        advice:
          nValue < 30
            ? t("analyzerNitrogenLowDetailed")
            : t("analyzerNitrogenAcceptableDetailed"),
        priority: nValue < 30 ? "high" : "low",
        icon: nValue < 30 ? "warning" : "checkmark-circle",
      },
      {
        week: t("phosphorusInsightTitle"),
        advice:
          pValue < 30
            ? t("analyzerPhosphorusLowDetailed")
            : t("analyzerPhosphorusSuitableDetailed"),
        priority: pValue < 30 ? "medium" : "low",
        icon: pValue < 30 ? "arrow-up-circle" : "checkmark-circle",
      },
      {
        week: t("potassiumInsightTitle"),
        advice:
          kValue < 30
            ? t("analyzerPotassiumLowDetailed")
            : t("analyzerPotassiumHealthyDetailed"),
        priority: kValue < 30 ? "medium" : "low",
        icon: kValue < 30 ? "warning" : "information-circle",
      },
      {
        week: t("fertilizerInsightTitle"),
        advice: latestPrediction?.recommended_fertilizer
          ? t("latestRecommendationDetailed", {
              fertilizer: latestPrediction.recommended_fertilizer,
              dosage:
                latestPrediction.recommended_dosage_g_per_plant ??
                t("notAvailable"),
              soil: soilType,
              stage,
            } as any)
          : t("analysisBasedOnSoilStage", {
              soil: soilType,
              stage,
            } as any),
        priority: "low",
        icon: "information-circle",
      },
    ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#F44336";
      case "medium":
        return "#FF9800";
      case "low":
        return "#4CAF50";
      default:
        return "#9E9E9E";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return t("high");
      case "medium":
        return t("medium");
      case "low":
        return t("low");
      default:
        return priority;
    }
  };

  const getStatus = (value: number) => {
    if (value >= 60) return t("high");
    if (value >= 30) return t("good");
    return t("low");
  };

  const periods = ["1W", "4W", "3M", "1Y"];

  return (
    <LinearGradient
      colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2E7D32"
            colors={["#2E7D32"]}
          />
        }
      >
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
              <Ionicons name="analytics" size={28} color="#2E7D32" />
            </View>
            <View>
              <Text style={styles.headerTitle}>{t("usageAnalyzer")}</Text>
              <Text style={styles.headerSubtitle}>
                {t("historyBasedFertilizerInsights")}
              </Text>
            </View>
          </View>
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>
              {t("loadingFertilizerAnalytics")}
            </Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={36} color="#F44336" />
            <Text style={styles.errorTitle}>{t("unableToLoadAnalytics")}</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>

            <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
              <Text style={styles.retryButtonText}>{t("tryAgain")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Animated.View
              style={[
                styles.periodSelector,
                { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
              ]}
            >
              {periods.map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.periodText,
                      selectedPeriod === period && styles.periodTextActive,
                    ]}
                  >
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>

            <Animated.View
              style={[
                styles.statsGrid,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              {stats.map((stat, index) => (
                <Animated.View key={index} style={styles.statCard}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: stat.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={stat.icon as any}
                      size={24}
                      color={stat.color}
                    />
                  </View>

                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue} numberOfLines={1}>
                    {stat.value}
                  </Text>
                  <Text style={styles.statSubtext} numberOfLines={1}>
                    {stat.subtext}
                  </Text>
                </Animated.View>
              ))}
            </Animated.View>

            <Animated.View
              style={[
                styles.chartCard,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View style={styles.chartHeader}>
                <View style={styles.chartHeaderLeft}>
                  <View style={styles.chartIconWrapper}>
                    <Ionicons name="trending-up" size={24} color="#2E7D32" />
                  </View>
                  <View>
                    <Text style={styles.chartTitle}>{t("usageTrend")}</Text>
                    <Text style={styles.chartSubtitle}>
                      {t("dosageTrendFromHistory")}
                    </Text>
                  </View>
                </View>

                <View style={styles.chartBadge}>
                  <Ionicons name="server-outline" size={14} color="#4CAF50" />
                  <Text style={styles.chartBadgeText}>{t("mongoDb")}</Text>
                </View>
              </View>

              <View style={styles.chartWrapper}>
                <LineChart
                  data={usageData}
                  width={chartWidth}
                  height={220}
                  chartConfig={{
                    backgroundGradientFrom: "#FFFFFF",
                    backgroundGradientTo: "#FFFFFF",
                    color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(78,110,78,${opacity})`,
                    strokeWidth: 3,
                    decimalPlaces: 0,
                    propsForDots: {
                      r: "7",
                      strokeWidth: "3",
                      stroke: "#2E7D32",
                      fill: "#FFFFFF",
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: "",
                      stroke: "#E0E0E0",
                      strokeWidth: 1,
                    },
                  }}
                  bezier
                  style={styles.chart}
                  withInnerLines
                  withOuterLines
                  withVerticalLines={false}
                  withHorizontalLines
                />
              </View>

              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#2E7D32" }]}
                  />
                  <Text style={styles.legendText}>
                    {t("recommendedDosageGramsPerPlant")}
                  </Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.chartCard,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View style={styles.chartHeader}>
                <View style={styles.chartHeaderLeft}>
                  <View style={styles.chartIconWrapper}>
                    <MaterialCommunityIcons
                      name="flask"
                      size={24}
                      color="#2E7D32"
                    />
                  </View>
                  <View>
                    <Text style={styles.chartTitle}>
                      {t("npkDistribution")}
                    </Text>
                    <Text style={styles.chartSubtitle}>
                      {t("currentNutrientValuesUsedForAnalysis")}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.chartWrapper}>
                <BarChart
                  data={npkData}
                  width={chartWidth}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundGradientFrom: "#FFFFFF",
                    backgroundGradientTo: "#FFFFFF",
                    color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(78,110,78,${opacity})`,
                    barPercentage: 0.6,
                    decimalPlaces: 0,
                    propsForBackgroundLines: {
                      strokeDasharray: "",
                      stroke: "#E0E0E0",
                      strokeWidth: 1,
                    },
                  }}
                  style={styles.chart}
                  withInnerLines
                  showValuesOnTopOfBars
                  fromZero
                />
              </View>

              <View style={styles.npkLegend}>
                {[
                  {
                    label: `${t("nitrogen")} (N)`,
                    color: "#4CAF50",
                    status: getStatus(nValue),
                  },
                  {
                    label: `${t("phosphorus")} (P)`,
                    color: "#FF9800",
                    status: getStatus(pValue),
                  },
                  {
                    label: `${t("potassium")} (K)`,
                    color: "#2196F3",
                    status: getStatus(kValue),
                  },
                ].map((item, index) => (
                  <View key={index} style={styles.npkLegendItem}>
                    <View
                      style={[
                        styles.npkLegendDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.npkLegendLabel}>{item.label}</Text>
                    <View
                      style={[
                        styles.npkStatusBadge,
                        { backgroundColor: item.color + "20" },
                      ]}
                    >
                      <Text
                        style={[styles.npkStatusText, { color: item.color }]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>

            <Animated.View
              style={[
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrapper}>
                  <MaterialCommunityIcons
                    name="robot"
                    size={24}
                    color="#2E7D32"
                  />
                </View>
                <Text style={styles.sectionTitle}>{t("aiInsights")}</Text>
              </View>

              {aiRecommendations.map((item: any, index: number) => (
                <Animated.View key={index} style={styles.aiCard}>
                  <View style={styles.aiCardHeader}>
                    <View style={styles.aiWeekBadge}>
                      <Text style={styles.aiWeekText}>{item.week}</Text>
                    </View>

                    <View
                      style={[
                        styles.aiPriorityBadge,
                        {
                          backgroundColor:
                            getPriorityColor(item.priority) + "20",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.priorityDot,
                          {
                            backgroundColor: getPriorityColor(item.priority),
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.aiPriorityText,
                          { color: getPriorityColor(item.priority) },
                        ]}
                      >
                        {getPriorityLabel(item.priority)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.aiCardBody}>
                    <View
                      style={[
                        styles.aiIconWrapper,
                        {
                          backgroundColor:
                            getPriorityColor(item.priority) + "15",
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={24}
                        color={getPriorityColor(item.priority)}
                      />
                    </View>
                    <Text style={styles.aiAdviceText}>{item.advice}</Text>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => router.push("/fertilizer-management/select")}
            >
              <LinearGradient
                colors={["#2E7D32", "#1B5E20"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionCardGradient}
              >
                <View style={styles.actionCardContent}>
                  <View style={styles.actionCardIcon}>
                    <Ionicons name="add-circle" size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.actionCardText}>
                    <Text style={styles.actionCardTitle}>
                      {t("createNewPlan")}
                    </Text>
                    <Text style={styles.actionCardSubtitle}>
                      {t("basedOnLatestAnalysis")}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },

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

  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  periodButtonActive: {
    backgroundColor: "#2E7D32",
  },
  periodText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4E6E4E",
  },
  periodTextActive: {
    color: "#FFFFFF",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
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
    fontSize: 12,
    color: "#4E6E4E",
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 2,
    maxWidth: "100%",
  },
  statSubtext: {
    fontSize: 11,
    color: "#9E9E9E",
    fontWeight: "500",
    maxWidth: "100%",
  },

  chartCard: {
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
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  chartIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
  },
  chartSubtitle: {
    fontSize: 12,
    color: "#4E6E4E",
    fontWeight: "500",
    marginTop: 2,
  },
  chartBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  chartBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4CAF50",
  },
  chartWrapper: {
    alignItems: "center",
    marginVertical: 12,
  },
  chart: {
    borderRadius: 16,
  },
  chartLegend: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: "#4E6E4E",
    fontWeight: "600",
  },

  npkLegend: {
    marginTop: 16,
    gap: 10,
  },
  npkLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  npkLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  npkLegendLabel: {
    flex: 1,
    fontSize: 13,
    color: "#4E6E4E",
    fontWeight: "600",
  },
  npkStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  npkStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionIconWrapper: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B5E20",
  },

  aiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  aiWeekBadge: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  aiWeekText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1B5E20",
  },
  aiPriorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  aiPriorityText: {
    fontSize: 11,
    fontWeight: "700",
  },
  aiCardBody: {
    flexDirection: "row",
    gap: 12,
  },
  aiIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  aiAdviceText: {
    flex: 1,
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 20,
    paddingTop: 12,
  },

  actionCard: {
    marginTop: 8,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  actionCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  actionCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionCardText: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  actionCardSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },

  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#4E6E4E",
    fontWeight: "600",
    textAlign: "center",
  },

  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1B5E20",
    marginTop: 12,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: "#4E6E4E",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#2E7D32",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
