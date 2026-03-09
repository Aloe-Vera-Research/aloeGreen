import { View, Text, StyleSheet, ScrollView, Platform, Animated, Dimensions } from "react-native";
import { useEffect, useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type Stat = {
  label: string;
  value: string;
  unit: string;
  iconName: string;
  iconLib: "ion" | "mci";
  trend: "up" | "down" | "stable";
  accent: string;
  iconBg: string;
  trendUp: boolean;
  trendDown: boolean;
  sublabel: string;
};

const STAT_CONFIG = [
  {
    label: "Temperature",
    unit: "°C",
    iconName: "thermometer",
    iconLib: "mci" as const,
    accent: "#E53935",
    iconBg: "#FFEBEE",
    sublabel: "Ambient air",
    compute: () => 28 + Math.random() * 4,
    trend: (v: number) => (v > 30 ? "up" : v < 29 ? "down" : "stable") as "up" | "down" | "stable",
  },
  {
    label: "Humidity",
    unit: "%",
    iconName: "water-percent",
    iconLib: "mci" as const,
    accent: "#0288D1",
    iconBg: "#E1F5FE",
    sublabel: "Relative humidity",
    compute: () => 60 + Math.random() * 10,
    trend: (v: number) => (v > 65 ? "up" : v < 62 ? "down" : "stable") as "up" | "down" | "stable",
  },
  {
    label: "Soil Moisture",
    unit: "%",
    iconName: "sprout-outline",
    iconLib: "mci" as const,
    accent: "#2E7D32",
    iconBg: "#E8F5E9",
    sublabel: "Ground level",
    compute: () => 45 + Math.random() * 10,
    trend: (v: number) => (v > 50 ? "up" : v < 47 ? "down" : "stable") as "up" | "down" | "stable",
  },
  {
    label: "Soil pH",
    unit: "",
    iconName: "flask-outline",
    iconLib: "ion" as const,
    accent: "#6A1B9A",
    iconBg: "#F3E5F5",
    sublabel: "Acidity level",
    compute: () => 6 + Math.random(),
    trend: () => "stable" as "up" | "down" | "stable",
  },
  {
    label: "Rainfall",
    unit: "mm",
    iconName: "rainy-outline",
    iconLib: "ion" as const,
    accent: "#1565C0",
    iconBg: "#E3F2FD",
    sublabel: "Last 24 hours",
    compute: () => Math.random() * 5,
    trend: (v: number) => (v > 3 ? "up" : "stable") as "up" | "down" | "stable",
  },
  {
    label: "Air Quality",
    unit: "AQI",
    iconName: "leaf-outline",
    iconLib: "ion" as const,
    accent: "#00796B",
    iconBg: "#E0F2F1",
    sublabel: "Index score",
    compute: () => 85 + Math.random() * 10,
    trend: () => "stable" as "up" | "down" | "stable",
  },
];

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const trendColor =
    stat.trend === "up" ? "#E53935" : stat.trend === "down" ? "#0288D1" : "#4CAF50";
  const trendIcon =
    stat.trend === "up" ? "trending-up" : stat.trend === "down" ? "trending-down" : "remove";

  return (
    <View style={styles.card}>
      {/* Top accent line */}
      <View style={[styles.cardTopLine, { backgroundColor: stat.accent }]} />

      <View style={styles.cardHeader}>
        {/* Icon */}
        <View style={[styles.cardIconWrap, { backgroundColor: stat.iconBg }]}>
          {stat.iconLib === "mci" ? (
            <MaterialCommunityIcons name={stat.iconName as any} size={20} color={stat.accent} />
          ) : (
            <Ionicons name={stat.iconName as any} size={20} color={stat.accent} />
          )}
        </View>

        {/* Trend badge */}
        <View style={[styles.trendBadge, { backgroundColor: `${trendColor}15` }]}>
          <Ionicons name={trendIcon as any} size={13} color={trendColor} />
        </View>
      </View>

      <Text style={styles.cardLabel}>{stat.label}</Text>
      <Text style={styles.cardSublabel}>{stat.sublabel}</Text>

      <View style={styles.valueRow}>
        <Text style={[styles.cardValue, { color: stat.accent }]}>{stat.value}</Text>
        {stat.unit ? <Text style={styles.cardUnit}>{stat.unit}</Text> : null}
      </View>

      {/* Bottom bar */}
      <View style={styles.cardBarBg}>
        <View style={[styles.cardBarFill, { backgroundColor: stat.accent, width: "55%" }]} />
      </View>
    </View>
  );
}

export default function LiveStats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [tick, setTick] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const updateStats = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.75, duration: 180, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();

      const newStats: Stat[] = STAT_CONFIG.map((cfg) => {
        const val = cfg.compute();
        const trend = cfg.trend(val);
        return {
          label: cfg.label,
          value: cfg.unit === "" ? val.toFixed(1) : cfg.unit === "°C" || cfg.unit === "mm" || cfg.unit === "AQI" ? val.toFixed(1) : val.toFixed(0),
          unit: cfg.unit,
          iconName: cfg.iconName,
          iconLib: cfg.iconLib,
          trend,
          accent: cfg.accent,
          iconBg: cfg.iconBg,
          trendUp: trend === "up",
          trendDown: trend === "down",
          sublabel: cfg.sublabel,
        };
      });

      setStats(newStats);
      setLastUpdate(new Date());
      setTick((t) => t + 1);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Progress for countdown ring (0–1 over 5s)
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(0);
    const step = 50;
    const total = 5000;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += step;
      setProgress(Math.min(elapsed / total, 1));
      if (elapsed >= total) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [tick]);

  return (
    <LinearGradient colors={["#E8F5E9", "#F1F8E9", "#FFFFFF"]} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <Animated.View
          style={[
            styles.header,
            { opacity: headerFade, transform: [{ translateY: headerSlide }] },
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerIconWrap}>
              <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={StyleSheet.absoluteFill} borderRadius={28} />
              <MaterialCommunityIcons name="access-point" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Farm Dashboard</Text>
              <Text style={styles.subtitle}>Real-time Environmental Monitoring</Text>
            </View>
          </View>

          {/* Status banner */}
          <View style={styles.statusBanner}>
            <View style={styles.statusLeft}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Live Monitoring</Text>
            </View>
            <View style={styles.statusRight}>
              <Ionicons name="time-outline" size={12} color="#4E6E4E" />
              <Text style={styles.statusTime}>
                {lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </Text>
            </View>
          </View>

          {/* Summary row */}
          <View style={styles.summaryRow}>
            {[
              { icon: "leaf-outline", lib: "ion", label: "6 Sensors", sub: "Active" },
              { icon: "wifi-outline", lib: "ion", label: "Connected", sub: "Network" },
              { icon: "reload-outline", lib: "ion", label: "5s Refresh", sub: "Interval" },
            ].map((item, i) => (
              <View key={i} style={styles.summaryItem}>
                <View style={styles.summaryIconWrap}>
                  <Ionicons name={item.icon as any} size={16} color="#2E7D32" />
                </View>
                <View>
                  <Text style={styles.summaryValue}>{item.label}</Text>
                  <Text style={styles.summarySub}>{item.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── Section label ── */}
        <Animated.View style={[styles.sectionRow, { opacity: headerFade }]}>
          <Text style={styles.sectionLabel}>Sensor Readings</Text>
          <View style={styles.sectionLine} />
          <View style={styles.refreshPill}>
            <View style={[styles.refreshBar, { width: `${progress * 100}%` as any }]} />
            <Text style={styles.refreshText}>Refreshing</Text>
          </View>
        </Animated.View>

        {/* ── Stats Grid ── */}
        <Animated.View style={[styles.grid, { opacity: fadeAnim }]}>
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </Animated.View>

        {/* ── Hero Summary Card ── */}
        <Animated.View style={{ opacity: headerFade }}>
          <View style={styles.heroCard}>
            <LinearGradient
              colors={["#2E7D32", "#1B5E20"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
              borderRadius={24}
            />
            <View style={styles.heroInner}>
              <View style={styles.heroLeft}>
                <View style={styles.heroIconWrap}>
                  <MaterialCommunityIcons name="chart-areaspline" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.heroLabel}>Farm Conditions</Text>
                <Text style={styles.heroValue}>Optimal</Text>
                <Text style={styles.heroSub}>All sensors within normal range</Text>
              </View>
              <View style={styles.heroRight}>
                {["Temp OK", "pH OK", "Moisture OK"].map((t, i) => (
                  <View key={i} style={styles.heroBadge}>
                    <Ionicons name="checkmark-circle" size={13} color="#A5D6A7" />
                    <Text style={styles.heroBadgeText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View style={[styles.footer, { opacity: headerFade }]}>
          <MaterialCommunityIcons name="leaf" size={14} color="#BDBDBD" />
          <Text style={styles.footerText}>Data refreshes every 5 seconds · Aloe Green</Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const CARD_W = (width - 18 * 2 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 64 : 50,
    paddingHorizontal: 18,
    paddingBottom: 48,
  },

  // Header
  header: { marginBottom: 24 },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  headerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  headerTextWrap: { flex: 1 },
  title: { fontSize: 26, fontWeight: "800", color: "#1B5E20", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: "#4E6E4E", fontWeight: "500", marginTop: 3 },

  // Status banner
  statusBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  statusLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4CAF50" },
  statusText: { fontSize: 13, fontWeight: "700", color: "#2E7D32" },
  statusRight: { flexDirection: "row", alignItems: "center", gap: 5 },
  statusTime: { fontSize: 12, color: "#4E6E4E", fontWeight: "600" },

  // Summary row
  summaryRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    gap: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryValue: { fontSize: 12, fontWeight: "700", color: "#1B5E20" },
  summarySub: { fontSize: 10, color: "#9E9E9E", fontWeight: "500" },

  // Section row
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9E9E9E",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  refreshPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  refreshBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#E8F5E9",
    borderRadius: 100,
  },
  refreshText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4E6E4E",
    letterSpacing: 0.3,
    zIndex: 1,
  },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },

  // Card
  card: {
    width: CARD_W,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },
  cardTopLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 6,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  trendBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 2,
  },
  cardSublabel: {
    fontSize: 10,
    color: "#9E9E9E",
    fontWeight: "500",
    marginBottom: 10,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
  },
  cardUnit: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9E9E9E",
    marginBottom: 2,
  },
  cardBarBg: {
    height: 4,
    backgroundColor: "#F5F5F5",
    borderRadius: 2,
    overflow: "hidden",
  },
  cardBarFill: {
    height: "100%",
    borderRadius: 2,
    opacity: 0.7,
  },

  // Hero card
  heroCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 120,
  },
  heroInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 22,
  },
  heroLeft: { flex: 1 },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  heroLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "400",
  },
  heroRight: { gap: 8, alignItems: "flex-end" },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: { fontSize: 12, color: "#BDBDBD", fontWeight: "500" },
});