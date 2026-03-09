import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import mqtt, { MqttClient } from "mqtt";

const { width } = Dimensions.get("window");

type Trend = "up" | "down" | "stable";

type Stat = {
  label: string;
  value: string;
  unit: string;
  iconName: string;
  iconLib: "ion" | "mci";
  trend: Trend;
  accent: string;
  iconBg: string;
  sublabel: string;
};

type SensorPayload = {
  device_id?: string;
  temp?: number;
  hum?: number;
  lux?: number;
  soil_m?: number;
  rainfall?: number;
  N?: number;
  P?: number;
  K?: number;
  npk_available?: boolean;
  dht_available?: boolean;
};

const HIVEMQ_HOST = "5b19de651ec740d7a8b737f7c9bbf428.s1.eu.hivemq.cloud";
const HIVEMQ_PORT = 8884; // HiveMQ Cloud secure websocket port
const MQTT_TOPIC = "aloeGreen/device01/data";

// Use a dedicated dashboard credential if possible
const MQTT_USERNAME = "eesara";
const MQTT_PASSWORD = "Eesara@123";

function getTrend(current?: number, previous?: number, tolerance = 0.01): Trend {
  if (current == null || previous == null) return "stable";
  if (current > previous + tolerance) return "up";
  if (current < previous - tolerance) return "down";
  return "stable";
}

function formatValue(value?: number, decimals = 1) {
  if (value == null || Number.isNaN(value)) return "--";
  return value.toFixed(decimals);
}

function StatCard({ stat }: { stat: Stat }) {
  const trendColor =
    stat.trend === "up" ? "#E53935" : stat.trend === "down" ? "#0288D1" : "#4CAF50";

  const trendIcon =
    stat.trend === "up" ? "trending-up" : stat.trend === "down" ? "trending-down" : "remove";

  return (
    <View style={styles.card}>
      <View style={[styles.cardTopLine, { backgroundColor: stat.accent }]} />

      <View style={styles.cardHeader}>
        <View style={[styles.cardIconWrap, { backgroundColor: stat.iconBg }]}>
          {stat.iconLib === "mci" ? (
            <MaterialCommunityIcons name={stat.iconName as any} size={20} color={stat.accent} />
          ) : (
            <Ionicons name={stat.iconName as any} size={20} color={stat.accent} />
          )}
        </View>

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

      <View style={styles.cardBarBg}>
        <View style={[styles.cardBarFill, { backgroundColor: stat.accent, width: "55%" }]} />
      </View>
    </View>
  );
}

export default function LiveStats() {
  const [sensorData, setSensorData] = useState<SensorPayload | null>(null);
  const [prevSensorData, setPrevSensorData] = useState<SensorPayload | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [tick, setTick] = useState(0);

  const clientRef = useRef<MqttClient | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerFade, headerSlide]);

  useEffect(() => {
    const mqttUrl = `wss://${HIVEMQ_HOST}:${HIVEMQ_PORT}/mqtt`;

    const client = mqtt.connect(mqttUrl, {
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      clientId: `expo_${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      reconnectPeriod: 3000,
      connectTimeout: 30_000,
    });

    clientRef.current = client;

    client.on("connect", () => {
      setIsConnected(true);

      client.subscribe(MQTT_TOPIC, { qos: 0 }, (err) => {
        if (err) {
          console.log("Subscribe error:", err.message);
        } else {
          console.log("Subscribed to:", MQTT_TOPIC);
        }
      });
    });

    client.on("reconnect", () => {
      console.log("Reconnecting to HiveMQ...");
    });

    client.on("error", (err) => {
      console.log("MQTT error:", err.message);
      setIsConnected(false);
    });

    client.on("close", () => {
      setIsConnected(false);
      console.log("MQTT connection closed");
    });

    client.on("message", (_topic, message) => {
      try {
        const parsed: SensorPayload = JSON.parse(message.toString());

        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.75,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();

        setPrevSensorData(sensorData);
        setSensorData(parsed);
        setLastUpdate(new Date());
        setTick((t) => t + 1);
      } catch (e) {
        console.log("Invalid MQTT payload:", e);
      }
    });

    return () => {
      client.end(true);
      clientRef.current = null;
    };
  }, [fadeAnim, sensorData]);

  const stats: Stat[] = useMemo(() => {
    const tempTrend = getTrend(sensorData?.temp, prevSensorData?.temp, 0.1);
    const humTrend = getTrend(sensorData?.hum, prevSensorData?.hum, 0.1);
    const soilTrend = getTrend(sensorData?.soil_m, prevSensorData?.soil_m, 0.1);
    const rainTrend = getTrend(sensorData?.rainfall, prevSensorData?.rainfall, 0.05);
    const luxTrend = getTrend(sensorData?.lux, prevSensorData?.lux, 1);
    const nTrend = getTrend(sensorData?.N, prevSensorData?.N, 0.1);

    return [
      {
        label: "Temperature",
        value: formatValue(sensorData?.temp, 1),
        unit: "°C",
        iconName: "thermometer",
        iconLib: "mci",
        trend: tempTrend,
        accent: "#E53935",
        iconBg: "#FFEBEE",
        sublabel: "Ambient air",
      },
      {
        label: "Humidity",
        value: formatValue(sensorData?.hum, 1),
        unit: "%",
        iconName: "water-percent",
        iconLib: "mci",
        trend: humTrend,
        accent: "#0288D1",
        iconBg: "#E1F5FE",
        sublabel: "Relative humidity",
      },
      {
        label: "Soil Moisture",
        value: formatValue(sensorData?.soil_m, 0),
        unit: "%",
        iconName: "sprout-outline",
        iconLib: "mci",
        trend: soilTrend,
        accent: "#2E7D32",
        iconBg: "#E8F5E9",
        sublabel: "Ground level",
      },
      {
        label: "Light",
        value: formatValue(sensorData?.lux, 0),
        unit: "lx",
        iconName: "sunny-outline",
        iconLib: "ion",
        trend: luxTrend,
        accent: "#F9A825",
        iconBg: "#FFF8E1",
        sublabel: "Illumination",
      },
      {
        label: "Rainfall",
        value: formatValue(sensorData?.rainfall, 2),
        unit: "mm",
        iconName: "rainy-outline",
        iconLib: "ion",
        trend: rainTrend,
        accent: "#1565C0",
        iconBg: "#E3F2FD",
        sublabel: "Accumulated",
      },
      {
        label: "Nitrogen",
        value: sensorData?.npk_available ? formatValue(sensorData?.N, 0) : "--",
        unit: "",
        iconName: "flask-outline",
        iconLib: "ion",
        trend: nTrend,
        accent: "#6A1B9A",
        iconBg: "#F3E5F5",
        sublabel: sensorData?.npk_available ? "NPK sensor" : "NPK unavailable",
      },
    ];
  }, [sensorData, prevSensorData]);

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.header,
            { opacity: headerFade, transform: [{ translateY: headerSlide }] },
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerIconWrap}>
              <LinearGradient
                colors={["#2E7D32", "#1B5E20"]}
                style={StyleSheet.absoluteFill}
                borderRadius={28}
              />
              <MaterialCommunityIcons name="access-point" size={28} color="#FFFFFF" />
            </View>

            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Farm Dashboard</Text>
              <Text style={styles.subtitle}>Real-time Environmental Monitoring</Text>
            </View>
          </View>

          <View style={styles.statusBanner}>
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? "#4CAF50" : "#E53935" },
                ]}
              />
              <Text style={styles.statusText}>
                {isConnected ? "Live Monitoring" : "Disconnected"}
              </Text>
            </View>

            <View style={styles.statusRight}>
              <Ionicons name="time-outline" size={12} color="#4E6E4E" />
              <Text style={styles.statusTime}>
                {lastUpdate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            {[
              { icon: "leaf-outline", label: "6 Sensors", sub: "Active" },
              { icon: "wifi-outline", label: isConnected ? "Connected" : "Offline", sub: "Network" },
              { icon: "reload-outline", label: "MQTT Live", sub: "HiveMQ" },
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

        <Animated.View style={[styles.sectionRow, { opacity: headerFade }]}>
          <Text style={styles.sectionLabel}>Sensor Readings</Text>
          <View style={styles.sectionLine} />
          <View style={styles.refreshPill}>
            <View style={[styles.refreshBar, { width: `${progress * 100}%` as any }]} />
            <Text style={styles.refreshText}>Live</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.grid, { opacity: fadeAnim }]}>
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </Animated.View>

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
                <Text style={styles.heroValue}>{isConnected ? "Live" : "Waiting"}</Text>
                <Text style={styles.heroSub}>
                  {sensorData
                    ? `Device: ${sensorData.device_id ?? "device01"}`
                    : "Waiting for first MQTT message"}
                </Text>
              </View>

              <View style={styles.heroRight}>
                {[
                  sensorData?.dht_available ? "DHT OK" : "DHT --",
                  sensorData?.npk_available ? "NPK OK" : "NPK --",
                  sensorData?.soil_m != null ? "Soil OK" : "Soil --",
                ].map((t, i) => (
                  <View key={i} style={styles.heroBadge}>
                    <Ionicons name="checkmark-circle" size={13} color="#A5D6A7" />
                    <Text style={styles.heroBadgeText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity: headerFade }]}>
          <MaterialCommunityIcons name="leaf" size={14} color="#BDBDBD" />
          <Text style={styles.footerText}>Live via HiveMQ Cloud</Text>
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

  summaryRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },

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

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: { fontSize: 12, color: "#BDBDBD", fontWeight: "500" },
});