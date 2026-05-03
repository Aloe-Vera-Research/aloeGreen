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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Circle, Rect, Text as SvgText, G } from "react-native-svg";
import { API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";

type Severity = "Healthy" | "Low" | "Medium" | "High" | "Critical";

type ScanRecord = {
  id: string;
  date: string;
  rawDate: string;
  time: string;
  disease: string;
  severity: Severity;
  confidence: number;
  imageUri: string | null;
  treatment?: string;
};

type DiseaseIconConfig = {
  bg: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
};

const DISEASE_ICON_MAP: Record<string, DiseaseIconConfig> = {
  Healthy:     { bg: "#C8E6C9", iconName: "leaf",                iconColor: "#2E7D32" },
  "Aloe Rust": { bg: "#FFE0B2", iconName: "virus",               iconColor: "#E64A19" },
  Anthracnose: { bg: "#FCE4EC", iconName: "bacteria",            iconColor: "#C2185B" },
  "Leaf Spot": { bg: "#FFF9C4", iconName: "dots-circle",         iconColor: "#F57F17" },
  Sunburn:     { bg: "#FFF8E1", iconName: "white-balance-sunny", iconColor: "#FF8F00" },
  Invalid:     { bg: "#F5F5F5", iconName: "help-circle-outline", iconColor: "#9E9E9E" },
};

const getFallbackIcon = (disease: string): DiseaseIconConfig =>
  DISEASE_ICON_MAP[disease] ?? DISEASE_ICON_MAP["Invalid"];

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({
  healthy,
  diseased,
  t,
}: {
  healthy: number;
  diseased: number;
  t: (key: string) => string;
}) {
  const total = healthy + diseased || 1;
  const size = 88;
  const r = 32;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const healthyPct   = healthy  / total;
  const diseasedPct  = diseased / total;
  const healthyDash  = healthyPct  * circ;
  const diseasedDash = diseasedPct * circ;
  const diseasedOffset = circ - healthyDash;

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        {/* track */}
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(46,125,50,0.12)" strokeWidth={10} />
        {diseased > 0 && (
          <Circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke="#FF8F00" strokeWidth={10}
            strokeDasharray={`${diseasedDash} ${circ - diseasedDash}`}
            strokeDashoffset={diseasedOffset}
            strokeLinecap="round"
            rotation={-90} origin={`${cx},${cy}`}
          />
        )}
        {healthy > 0 && (
          <Circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke="#2E7D32" strokeWidth={10}
            strokeDasharray={`${healthyDash} ${circ - healthyDash}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            rotation={-90} origin={`${cx},${cy}`}
          />
        )}
        <SvgText x={cx} y={cy - 6} textAnchor="middle" fontSize={18} fontWeight="700" fill="#1B5E20">
          {total}
        </SvgText>
        <SvgText x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill="#4E6E4E">
          {t("chartTotal")}
        </SvgText>
      </Svg>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#2E7D32" }} />
          <Text style={{ fontSize: 10, color: "#2E7D32", fontWeight: "600" }}>
            {Math.round(healthyPct * 100)}%
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FF8F00" }} />
          <Text style={{ fontSize: 10, color: "#E65100", fontWeight: "600" }}>
            {Math.round(diseasedPct * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── 7-day bar sparkline ──────────────────────────────────────────────────────
function WeekBar({
  scans,
  t,
}: {
  scans: ScanRecord[];
  t: (key: string) => string;
}) {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIdx  = (new Date().getDay() + 6) % 7;

  const counts = dayLabels.map((_, i) => {
    const target = new Date();
    target.setDate(target.getDate() - ((todayIdx - i + 7) % 7));
    return scans.filter((s) => {
      const scanDate = new Date(s.rawDate);
      return scanDate.toDateString() === target.toDateString();
    }).length;
  });

  const hasData = counts.some((c) => c > 0);
  const display = hasData ? counts : [1, 0, 2, 1, 3, 0, 2];
  const maxVal  = Math.max(...display, 1);

  const barW   = 18;
  const gap    = 7;
  const chartH = 48;
  const totalW = dayLabels.length * (barW + gap) - gap;

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 10, color: "#2E7D32", fontWeight: "700", letterSpacing: 0.5, marginBottom: 8, textTransform: "uppercase" }}>
        {t("chartThisWeek")}
      </Text>
      <Svg width={totalW} height={chartH + 18}>
        {display.map((val, i) => {
          const barH  = Math.max((val / maxVal) * chartH, val > 0 ? 6 : 3);
          const x     = i * (barW + gap);
          const y     = chartH - barH;
          const isToday = i === todayIdx;
          return (
            <G key={i}>
              <Rect
                x={x} y={y} width={barW} height={barH} rx={5}
                fill={isToday ? "#2E7D32" : val > 0 ? "#A5D6A7" : "rgba(46,125,50,0.12)"}
              />
              <SvgText
                x={x + barW / 2} y={chartH + 13}
                textAnchor="middle" fontSize={8}
                fill={isToday ? "#1B5E20" : "#4E6E4E"}
                fontWeight={isToday ? "700" : "400"}
              >
                {dayLabels[i]}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ScanHistoryScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { id: "all",      label: t("filterAll"),      icon: "apps" as const },
    { id: "healthy",  label: t("filterHealthy"),  icon: "checkmark-circle" as const },
    { id: "diseased", label: t("filterDiseased"), icon: "alert-circle" as const },
  ];

  useEffect(() => {
    fetchHistory();
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const getSeverityFromDisease = (disease: string): Severity => {
    switch (disease) {
      case "Healthy":     return "Healthy";
      case "Aloe Rust":
      case "Anthracnose": return "High";
      case "Leaf Spot":
      case "Sunburn":     return "Medium";
      case "Invalid":     return "Low";
      default:            return "Low";
    }
  };

  const getTranslatedDisease = (disease: string) => {
    switch (disease) {
      case "Aloe Rust":   return t("aloeRust");
      case "Anthracnose": return t("anthracnose");
      case "Healthy":     return t("healthy");
      case "Leaf Spot":   return t("leafSpot");
      case "Sunburn":     return t("sunburn");
      case "Invalid":     return t("invalid");
      default:            return disease || t("unknown");
    }
  };

  const getSeverityLabel = (severity: Severity) => {
    switch (severity) {
      case "Healthy":  return t("healthy");
      case "Low":      return t("severityLow");
      case "Medium":   return t("severityMedium");
      case "High":     return t("severityHigh");
      case "Critical": return t("severityCritical");
      default:         return severity;
    }
  };

  const getTreatmentFromDisease = (disease: string) => {
    switch (disease) {
      case "Aloe Rust":   return t("diseaseTreatmentAloeRust");
      case "Anthracnose": return t("diseaseTreatmentAnthracnose");
      case "Leaf Spot":   return t("diseaseTreatmentLeafSpot");
      case "Sunburn":     return t("diseaseTreatmentSunburn");
      case "Healthy":     return undefined;
      case "Invalid":     return t("diseaseTreatmentInvalid");
      default:            return t("diseaseTreatmentDefault");
    }
  };

  const formatDateLabel = (dateObj: Date) => {
    const todayDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(todayDate.getDate() - 1);
    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
    if (sameDay(dateObj, todayDate))     return t("today");
    if (sameDay(dateObj, yesterdayDate)) return t("yesterday");
    return dateObj.toLocaleDateString();
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.diseaseHistory);
      const result   = await response.json();
      const formatted: ScanRecord[] = (result.data || []).map((item: any) => {
        const dateObj = new Date(item.created_at);
        const confidenceValue =
          Number(item.confidence) <= 1
            ? Number(item.confidence) * 100
            : Number(item.confidence);
        return {
          id: item._id,
          date: formatDateLabel(dateObj),
          rawDate: item.created_at,
          time: dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

  const onRefresh = () => { setRefreshing(true); fetchHistory(); };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Healthy":  return "#1B5E20";
      case "Low":      return "#7B5800";
      case "Medium":   return "#BF360C";
      case "High":     return "#B71C1C";
      case "Critical": return "#880E0E";
      default:         return "#424242";
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case "Healthy":  return "#C8E6C9";
      case "Low":      return "#FFF9C4";
      case "Medium":   return "#FFE0B2";
      case "High":     return "#FFCCBC";
      case "Critical": return "#FFCDD2";
      default:         return "#F5F5F5";
    }
  };

  const getFilteredScans = () => {
    if (activeFilter === "healthy")  return scanHistory.filter((s) => s.severity === "Healthy");
    if (activeFilter === "diseased") return scanHistory.filter((s) => s.severity !== "Healthy");
    return scanHistory;
  };

  const filteredScans = getFilteredScans();

  const stats = {
    total:    scanHistory.length,
    healthy:  scanHistory.filter((s) => s.severity === "Healthy").length,
    diseased: scanHistory.filter((s) => s.severity !== "Healthy").length,
  };

  const groupedScans = filteredScans.reduce<Record<string, ScanRecord[]>>((acc, scan) => {
    if (!acc[scan.date]) acc[scan.date] = [];
    acc[scan.date].push(scan);
    return acc;
  }, {});

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />

      {/* Same light gradient as DiseaseManagementIntro */}
      <LinearGradient colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]} style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="#1B5E20" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>{t("scanHistoryTitle")}</Text>
              <Text style={styles.subtitle}>
                {filteredScans.length}{" "}
                {filteredScans.length === 1 ? t("scanSingular") : t("scanPlural")}
              </Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="search" size={20} color="#1B5E20" />
            </TouchableOpacity>
          </View>

          {/* ── Stats ── */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, styles.statCardAccent]}>
              <Ionicons name="scan-circle" size={24} color="#2E7D32" />
              <View style={styles.statContent}>
                <Text style={[styles.statNumber, { color: "#1B5E20" }]}>{stats.total}</Text>
                <Text style={styles.statLabel}>{t("totalScans")}</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
              <View style={styles.statContent}>
                <Text style={[styles.statNumber, { color: "#1B5E20" }]}>{stats.healthy}</Text>
                <Text style={styles.statLabel}>{t("healthy")}</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="alert-circle" size={24} color="#E64A19" />
              <View style={styles.statContent}>
                <Text style={[styles.statNumber, { color: "#BF360C" }]}>{stats.diseased}</Text>
                <Text style={styles.statLabel}>{t("diseased")}</Text>
              </View>
            </View>
          </View>

          {/* ── Charts card ── */}
          <View style={styles.chartsCard}>
            <DonutChart healthy={stats.healthy} diseased={stats.diseased} t={t} />
            <View style={styles.chartDivider} />
            <WeekBar scans={scanHistory} t={t} />
          </View>

          {/* ── Sheet ── */}
          <View style={styles.sheet}>
            <View style={styles.filterRow}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  activeOpacity={0.7}
                  style={[styles.chip, activeFilter === filter.id && styles.chipActive]}
                  onPress={() => setActiveFilter(filter.id)}
                >
                  <Ionicons
                    name={filter.icon}
                    size={14}
                    color={activeFilter === filter.id ? "#FFFFFF" : "#2E7D32"}
                  />
                  <Text style={[styles.chipText, activeFilter === filter.id && styles.chipTextActive]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>{t("loadingScanHistory")}</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.listContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#2E7D32"
                    colors={["#2E7D32"]}
                  />
                }
              >
                {filteredScans.length === 0 ? (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIconWrap}>
                      <Ionicons name="leaf-outline" size={40} color="#2E7D32" />
                    </View>
                    <Text style={styles.emptyTitle}>{t("noScansFound")}</Text>
                    <Text style={styles.emptySubtitle}>{t("startScanningLeavesHistory")}</Text>
                    <TouchableOpacity
                      style={styles.emptyCTA}
                      onPress={() => router.push("/disease-management/capture")}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={["#2E7D32", "#1B5E20"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.emptyCTAGradient}
                      >
                        <Text style={styles.emptyCTAText}>{t("scanNow")}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ) : (
                  Object.entries(groupedScans).map(([dateLabel, scans]) => (
                    <View key={dateLabel}>
                      <Text style={styles.sectionLabel}>{dateLabel}</Text>
                      {scans.map((scan, index) => {
                        const { bg, iconName, iconColor } = getFallbackIcon(scan.disease);
                        return (
                          <Animated.View
                            key={scan.id}
                            style={[
                              styles.scanCard,
                              {
                                opacity: fadeAnim,
                                transform: [{
                                  translateY: fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [40 + index * 8, 0],
                                  }),
                                }],
                              },
                            ]}
                          >
                            <TouchableOpacity activeOpacity={0.85} style={styles.scanCardContent}>
                              <View style={styles.thumbWrap}>
                                {scan.imageUri ? (
                                  <Image source={{ uri: scan.imageUri }} style={styles.thumb} resizeMode="cover" />
                                ) : (
                                  <View style={[styles.thumb, styles.iconThumb, { backgroundColor: bg }]}>
                                    <MaterialCommunityIcons name={iconName} size={32} color={iconColor} />
                                  </View>
                                )}
                                <View style={[styles.severityPill, { backgroundColor: getSeverityBgColor(scan.severity) }]}>
                                  <Text style={[styles.severityText, { color: getSeverityColor(scan.severity) }]}>
                                    {getSeverityLabel(scan.severity)}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.cardBody}>
                                <View style={styles.cardTop}>
                                  <Text style={styles.diseaseName} numberOfLines={1}>
                                    {getTranslatedDisease(scan.disease)}
                                  </Text>
                                  <View style={styles.confPill}>
                                    <Ionicons name="speedometer-outline" size={11} color="#1B5E20" />
                                    <Text style={styles.confText}>{scan.confidence.toFixed(1)}%</Text>
                                  </View>
                                </View>

                                <View style={styles.metaRow}>
                                  <Ionicons name="calendar-outline" size={12} color="#4E6E4E" />
                                  <Text style={styles.metaText}>{scan.date}</Text>
                                  <Ionicons name="time-outline" size={12} color="#4E6E4E" style={{ marginLeft: 6 }} />
                                  <Text style={styles.metaText}>{scan.time}</Text>
                                </View>

                                {scan.treatment && (
                                  <View style={styles.treatmentBox}>
                                    <Ionicons name="medical-outline" size={12} color="#2E7D32" style={{ marginTop: 1 }} />
                                    <Text style={styles.treatmentText} numberOfLines={2}>
                                      {scan.treatment}
                                    </Text>
                                  </View>
                                )}
                              </View>

                              <Ionicons name="chevron-forward" size={16} color="#A5D6A7" />
                            </TouchableOpacity>
                          </Animated.View>
                        );
                      })}
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </Animated.View>

        {/* ── FAB ── */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => router.push("/disease-management/capture")}
        >
          <LinearGradient
            colors={["#2E7D32", "#1B5E20"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="camera" size={26} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { flex: 1, paddingTop: 52 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, marginBottom: 18, gap: 12,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  headerText: { flex: 1 },
  title: {
    fontSize: 24, fontWeight: "800", color: "#1B5E20",
    letterSpacing: 0.3,
  },
  subtitle: { fontSize: 13, color: "#2E7D32", fontWeight: "600", marginTop: 2 },

  // ── Stats ───────────────────────────────────────────────────────────────────
  statsContainer: {
    flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 14,
  },
  statCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16,
    padding: 12, alignItems: "center", gap: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  statCardAccent: { backgroundColor: "#E8F5E9" },
  statContent:    { alignItems: "center" },
  statNumber:     { fontSize: 22, fontWeight: "800", lineHeight: 26 },
  statLabel: {
    fontSize: 10, color: "#4E6E4E", fontWeight: "600",
    letterSpacing: 0.3, textTransform: "uppercase", marginTop: 2,
  },

  // ── Charts card ─────────────────────────────────────────────────────────────
  chartsCard: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 16, paddingHorizontal: 18,
    flexDirection: "row", alignItems: "center", gap: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  chartDivider: {
    width: 1, height: 70, backgroundColor: "#E0E0E0",
  },

  // ── Sheet ───────────────────────────────────────────────────────────────────
  sheet: {
    flex: 1, backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8,
  },

  filterRow: {
    flexDirection: "row", paddingHorizontal: 16,
    paddingTop: 16, paddingBottom: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: "#E8F5E9",
  },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#F1F8F4",
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1.5, borderColor: "#E0E0E0",
  },
  chipActive:     { backgroundColor: "#2E7D32", borderColor: "#2E7D32" },
  chipText:       { fontSize: 13, fontWeight: "600", color: "#2E7D32" },
  chipTextActive: { color: "#FFFFFF" },

  listContainer: { flex: 1 },
  listContent:   { paddingHorizontal: 14, paddingBottom: 110 },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "#4E6E4E",
    letterSpacing: 0.8, textTransform: "uppercase",
    paddingTop: 16, paddingBottom: 8, paddingLeft: 2,
  },

  loadingContainer: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80,
  },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: "600", color: "#2E7D32" },

  // ── Scan Card ────────────────────────────────────────────────────────────────
  scanCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, marginBottom: 10,
    borderWidth: 1, borderColor: "rgba(46,125,50,0.12)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    overflow: "hidden",
  },
  scanCardContent: {
    flexDirection: "row", padding: 12, alignItems: "center", gap: 12,
  },

  thumbWrap: { position: "relative" },
  thumb:     { width: 70, height: 70, borderRadius: 13, backgroundColor: "#F5F5F5" },
  iconThumb: { alignItems: "center", justifyContent: "center" },

  severityPill: {
    position: "absolute", bottom: 4, left: "50%",
    transform: [{ translateX: -24 }],
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, minWidth: 48, alignItems: "center",
  },
  severityText: { fontSize: 8, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 },

  cardBody: { flex: 1, gap: 5 },
  cardTop:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  diseaseName: { fontSize: 15, fontWeight: "700", color: "#1B5E20", flex: 1, letterSpacing: -0.2 },

  confPill: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#E8F5E9", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7,
  },
  confText: { fontSize: 11, fontWeight: "700", color: "#1B5E20", fontVariant: ["tabular-nums"] },

  metaRow:  { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, color: "#4E6E4E", fontWeight: "500" },

  treatmentBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 5,
    backgroundColor: "#F1F8F4", padding: 7, borderRadius: 9, marginTop: 2,
  },
  treatmentText: {
    fontSize: 11, color: "#2E7D32", fontWeight: "600", flex: 1, lineHeight: 15,
  },

  // ── Empty state ──────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center", justifyContent: "center",
    paddingVertical: 80, paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: "#E8F5E9",
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  emptyTitle:    { fontSize: 20, fontWeight: "700", color: "#1B5E20", marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: "#4E6E4E", textAlign: "center", marginTop: 8, lineHeight: 20 },
  emptyCTA:      { borderRadius: 16, overflow: "hidden", marginTop: 22 },
  emptyCTAGradient: {
    paddingVertical: 14, paddingHorizontal: 32,
  },
  emptyCTAText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", textAlign: "center" },

  // ── FAB ──────────────────────────────────────────────────────────────────────
  fab: {
    position: "absolute", bottom: 30, right: 20, borderRadius: 18,
    shadowColor: "#2E7D32", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8, overflow: "hidden",
  },
  fabGradient: {
    width: 58, height: 58, borderRadius: 18,
    justifyContent: "center", alignItems: "center",
  },
});