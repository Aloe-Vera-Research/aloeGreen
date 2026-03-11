import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import mqtt, { MqttClient } from "mqtt";

const { width } = Dimensions.get("window");

type SensorPayload = {
  device_id?: string;
  temperature_c?: number;
  humidity_pct?: number;
  light_lux?: number;
  soil_moisture_raw?: number;
  rainfall_mm?: number;
  soil_ph?: number;
  soil_ec?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  dht_ok?: boolean;
  light_ok?: boolean;
  modbus_ok?: boolean;
  wifi_rssi?: number;
  uptime_ms?: number;
};

// HiveMQ Cloud
const HIVEMQ_HOST = "5b19de651ec740d7a8b737f7c9bbf428.s1.eu.hivemq.cloud";
const HIVEMQ_PORT = 8884;
const MQTT_TOPIC = "aloeGreen/device01/data";
const MQTT_USERNAME = "eesara";
const MQTT_PASSWORD = "Eesara@123";

export default function EnvironmentScreen() {
  const [sensorData, setSensorData] = useState<SensorPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState("Waiting for data...");
  const [messageCount, setMessageCount] = useState(0);

  const clientRef = useRef<MqttClient | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const disconnectMqtt = () => {
    if (clientRef.current) {
      try {
        clientRef.current.removeAllListeners();
        clientRef.current.end(true);
      } catch (e) {
        console.log("MQTT cleanup error:", e);
      }
      clientRef.current = null;
    }
  };

  const connectMqtt = () => {
    disconnectMqtt();

    const mqttUrl = `wss://${HIVEMQ_HOST}:${HIVEMQ_PORT}/mqtt`;
    console.log("Connecting MQTT to:", mqttUrl);

    const client = mqtt.connect(mqttUrl, {
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      clientId: `expo_env_${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      reconnectPeriod: 3000,
      connectTimeout: 30000,
      keepalive: 60,
    });

    clientRef.current = client;

    client.on("connect", () => {
      console.log("MQTT connected");
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
      setIsConnected(false);
    });

    client.on("error", (err) => {
      console.log("MQTT error:", err.message);
      setIsConnected(false);
    });

    client.on("close", () => {
      console.log("MQTT connection closed");
      setIsConnected(false);
    });

    client.on("offline", () => {
      console.log("MQTT offline");
      setIsConnected(false);
    });

    client.on("message", (_topic, message) => {
      try {
        const raw = message.toString();
        console.log("MQTT raw payload:", raw);

        const parsed: SensorPayload = JSON.parse(raw);
        console.log("MQTT parsed payload:", parsed);

        setSensorData(parsed);
        setMessageCount((prev) => prev + 1);

        const now = new Date();
        setLastSync(
          `Today • ${now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}`
        );

        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.92,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (e) {
        console.log("Invalid MQTT payload:", e);
      }
    });
  };

  useEffect(() => {
    connectMqtt();

    return () => {
      disconnectMqtt();
    };
  }, []);

  const temperature = sensorData?.temperature_c ?? 0;
  const soilMoistureRaw = sensorData?.soil_moisture_raw ?? 0;
  const humidity = sensorData?.humidity_pct ?? 0;
  const rainfall = sensorData?.rainfall_mm ?? 0;
  const lux = sensorData?.light_lux ?? 0;
  const soilPH = sensorData?.soil_ph ?? 0;
  const soilEC = sensorData?.soil_ec ?? 0;
  const nitrogen = sensorData?.nitrogen ?? 0;
  const phosphorus = sensorData?.phosphorus ?? 0;
  const potassium = sensorData?.potassium ?? 0;

  const dhtOk = sensorData?.dht_ok ?? false;
  const lightOk = sensorData?.light_ok ?? false;
  const modbusOk = sensorData?.modbus_ok ?? false;

  const soilMoisturePercent = useMemo(() => {
    const percent = ((4095 - soilMoistureRaw) / 4095) * 100;
    return Math.max(0, Math.min(100, percent));
  }, [soilMoistureRaw]);

  const getTemperatureStatus = () => {
    if (!dhtOk) {
      return { level: "No Data", color: "#9E9E9E", icon: "remove-circle" as const };
    }
    if (temperature > 35) {
      return { level: "Critical", color: "#D32F2F", icon: "alert-circle" as const };
    }
    if (temperature > 30) {
      return { level: "Warning", color: "#F57C00", icon: "warning" as const };
    }
    return { level: "Optimal", color: "#2E7D32", icon: "checkmark-circle" as const };
  };

  const getMoistureStatus = () => {
    if (soilMoisturePercent < 30) {
      return { level: "Critical", color: "#D32F2F", icon: "alert-circle" as const };
    }
    if (soilMoisturePercent < 40) {
      return { level: "Low", color: "#F57C00", icon: "warning" as const };
    }
    if (soilMoisturePercent > 70) {
      return { level: "High", color: "#1976D2", icon: "information-circle" as const };
    }
    return { level: "Optimal", color: "#2E7D32", icon: "checkmark-circle" as const };
  };

  const getHumidityStatus = () => {
    if (!dhtOk) {
      return { level: "No Data", color: "#9E9E9E", icon: "remove-circle" as const };
    }
    if (humidity > 80) {
      return { level: "High", color: "#1976D2", icon: "information-circle" as const };
    }
    if (humidity < 40) {
      return { level: "Low", color: "#F57C00", icon: "warning" as const };
    }
    return { level: "Optimal", color: "#2E7D32", icon: "checkmark-circle" as const };
  };

  const tempStatus = getTemperatureStatus();
  const moistureStatus = getMoistureStatus();
  const humidityStatus = getHumidityStatus();

  const calculateHealthScore = () => {
    let score = 100;

    if (dhtOk) {
      if (temperature > 35) score -= 30;
      else if (temperature > 30) score -= 15;

      if (humidity > 80 || humidity < 40) score -= 10;
    } else {
      score -= 10;
    }

    if (soilMoisturePercent < 30) score -= 30;
    else if (soilMoisturePercent < 40) score -= 15;

    return Math.max(0, score);
  };

  const healthScore = calculateHealthScore();
  const healthColor =
    healthScore >= 80 ? "#2E7D32" : healthScore >= 60 ? "#F57C00" : "#D32F2F";

  const sensors = [
    {
      id: 1,
      label: "Temperature",
      value: dhtOk ? Number(temperature).toFixed(1) : "--",
      unit: "°C",
      icon: "thermometer-outline",
      gradient: ["#FF6B35", "#F7931E"],
      status: tempStatus,
      optimal: "25-35°C",
      progress: dhtOk ? Math.max(0, Math.min(temperature / 40, 1)) : 0,
    },
    {
      id: 2,
      label: "Soil Moisture",
      value: Math.round(soilMoisturePercent).toString(),
      unit: "%",
      icon: "water-outline",
      gradient: ["#4FC3F7", "#29B6F6"],
      status: moistureStatus,
      optimal: "40-70%",
      progress: Math.max(0, Math.min(soilMoisturePercent / 100, 1)),
    },
    {
      id: 3,
      label: "Humidity",
      value: dhtOk ? Number(humidity).toFixed(1) : "--",
      unit: "%",
      icon: "cloud-outline",
      gradient: ["#78909C", "#607D8B"],
      status: humidityStatus,
      optimal: "40-80%",
      progress: dhtOk ? Math.max(0, Math.min(humidity / 100, 1)) : 0,
    },
    {
      id: 4,
      label: "Rainfall",
      value: Number(rainfall).toFixed(2),
      unit: "mm",
      icon: "rainy-outline",
      gradient: ["#66BB6A", "#43A047"],
      status: { level: "Live", color: "#546E7A", icon: "water" as const },
      optimal: "Accumulated",
      progress: Math.max(0, Math.min(rainfall / 10, 1)),
    },
  ];

  const hasLiveData = sensorData !== null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Environment Monitor</Text>
            <Text style={styles.subtitle}>Real-time IoT sensor data</Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            activeOpacity={0.7}
            onPress={connectMqtt}
          >
            <Ionicons name="refresh" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        <View style={styles.connectionRow}>
          <View
            style={[
              styles.connectionDot,
              { backgroundColor: isConnected ? "#4CAF50" : "#D32F2F" },
            ]}
          />
          <Text style={styles.connectionText}>
            {isConnected ? "Connected to HiveMQ Live Feed" : "Disconnected"}
          </Text>
        </View>

        <Animated.View
          style={[
            styles.healthCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={[healthColor + "15", healthColor + "05"]}
            style={styles.healthGradient}
          >
            <View style={styles.healthContent}>
              <View style={styles.healthLeft}>
                <Text style={styles.healthLabel}>Farm Health Score</Text>
                <View style={styles.scoreContainer}>
                  <Text style={[styles.scoreValue, { color: healthColor }]}>
                    {healthScore}
                  </Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>
                <Text style={styles.healthStatus}>
                  {healthScore >= 80
                    ? "Excellent Conditions"
                    : healthScore >= 60
                    ? "Monitor Closely"
                    : "Action Required"}
                </Text>
              </View>

              <View style={[styles.healthCircle, { borderColor: healthColor }]}>
                <Ionicons
                  name={
                    healthScore >= 80
                      ? "leaf"
                      : healthScore >= 60
                      ? "alert-circle"
                      : "warning"
                  }
                  size={32}
                  color={healthColor}
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      {!hasLiveData && (
        <View style={styles.analysisSection}>
          <View style={styles.analysisCard}>
            <Text style={styles.analysisLabel}>Waiting for first MQTT message</Text>
            <Text style={styles.analysisDescription}>
              Broker connection is {isConnected ? "active" : "not active"}.
              Once a payload arrives on {MQTT_TOPIC}, the cards will update here.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.sensorsSection}>
        <Text style={styles.sectionTitle}>Sensor Readings</Text>
        <View style={styles.grid}>
          {sensors.map((sensor, index) => (
            <Animated.View
              key={sensor.id}
              style={[
                styles.sensorCardWrapper,
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
              <TouchableOpacity style={styles.sensorCard} activeOpacity={0.9}>
                <LinearGradient
                  colors={sensor.gradient as [string, string]}
                  style={styles.iconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={sensor.icon as any} size={24} color="#FFFFFF" />
                </LinearGradient>

                <View style={styles.sensorInfo}>
                  <Text style={styles.sensorLabel}>{sensor.label}</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.sensorValue}>{sensor.value}</Text>
                    <Text style={styles.sensorUnit}>{sensor.unit}</Text>
                  </View>
                  <Text style={styles.optimalText}>Optimal: {sensor.optimal}</Text>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${sensor.progress * 100}%`,
                        backgroundColor: sensor.status.color,
                      },
                    ]}
                  />
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: sensor.status.color + "15" },
                  ]}
                >
                  <Ionicons
                    name={sensor.status.icon as any}
                    size={12}
                    color={sensor.status.color}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: sensor.status.color },
                    ]}
                  >
                    {sensor.status.level}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Stress Indicators</Text>
        <View style={styles.analysisCard}>
          <View style={styles.analysisItem}>
            <View style={styles.analysisLeft}>
              <View style={[styles.analysisIcon, { backgroundColor: tempStatus.color + "15" }]}>
                <Ionicons name="flame-outline" size={20} color={tempStatus.color} />
              </View>
              <View>
                <Text style={styles.analysisLabel}>Heat Stress</Text>
                <Text style={styles.analysisDescription}>
                  {!dhtOk
                    ? "Temperature sensor data unavailable"
                    : temperature > 35
                    ? "Provide shade & increase watering"
                    : temperature > 30
                    ? "Monitor plant health"
                    : "Temperature within range"}
                </Text>
              </View>
            </View>
            <View style={[styles.statusPill, { backgroundColor: tempStatus.color + "15" }]}>
              <Text style={[styles.statusPillText, { color: tempStatus.color }]}>
                {tempStatus.level}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.analysisItem}>
            <View style={styles.analysisLeft}>
              <View
                style={[
                  styles.analysisIcon,
                  { backgroundColor: moistureStatus.color + "15" },
                ]}
              >
                <Ionicons name="water-outline" size={20} color={moistureStatus.color} />
              </View>
              <View>
                <Text style={styles.analysisLabel}>Water Stress</Text>
                <Text style={styles.analysisDescription}>
                  {soilMoisturePercent < 30
                    ? "Immediate irrigation needed"
                    : soilMoisturePercent < 40
                    ? "Schedule irrigation soon"
                    : "Moisture levels adequate"}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: moistureStatus.color + "15" },
              ]}
            >
              <Text style={[styles.statusPillText, { color: moistureStatus.color }]}>
                {moistureStatus.level}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.recommendationsSection}>
        <Text style={styles.sectionTitle}>Smart Recommendations</Text>

        {dhtOk && temperature > 30 && (
          <View style={[styles.recommendationCard, styles.warningCard]}>
            <View style={styles.recommendationIcon}>
              <Ionicons name="sunny" size={20} color="#F57C00" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>High Temperature Alert</Text>
              <Text style={styles.recommendationText}>
                Consider installing shade nets or increasing irrigation frequency to prevent heat stress.
              </Text>
            </View>
          </View>
        )}

        {soilMoisturePercent < 40 && (
          <View style={[styles.recommendationCard, styles.criticalCard]}>
            <View style={styles.recommendationIcon}>
              <Ionicons name="water" size={20} color="#1976D2" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Irrigation Needed</Text>
              <Text style={styles.recommendationText}>
                Soil moisture is below optimal range. Schedule irrigation within the next 24 hours.
              </Text>
            </View>
          </View>
        )}

        {((!dhtOk) || temperature <= 30) && soilMoisturePercent >= 40 && (
          <View style={[styles.recommendationCard, styles.successCard]}>
            <View style={styles.recommendationIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Stable Conditions</Text>
              <Text style={styles.recommendationText}>
                Current soil condition looks acceptable. Continue monitoring the live feed.
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Additional Readings</Text>
        <View style={styles.analysisCard}>
          <Text style={styles.analysisLabel}>Device: {sensorData?.device_id ?? "--"}</Text>
          <Text style={styles.analysisLabel}>Messages Received: {messageCount}</Text>
          <Text style={styles.analysisLabel}>Light: {lightOk ? Number(lux).toFixed(0) : "--"} lx</Text>
          <Text style={styles.analysisLabel}>Soil pH: {modbusOk ? Number(soilPH).toFixed(1) : "--"}</Text>
          <Text style={styles.analysisLabel}>Soil EC: {modbusOk ? soilEC : "--"}</Text>
          <Text style={styles.analysisLabel}>Nitrogen: {modbusOk ? nitrogen : "--"}</Text>
          <Text style={styles.analysisLabel}>Phosphorus: {modbusOk ? phosphorus : "--"}</Text>
          <Text style={styles.analysisLabel}>Potassium: {modbusOk ? potassium : "--"}</Text>
          <Text style={styles.analysisLabel}>WiFi RSSI: {sensorData?.wifi_rssi ?? "--"} dBm</Text>
          <Text style={styles.analysisLabel}>DHT Status: {dhtOk ? "OK" : "FAIL"}</Text>
          <Text style={styles.analysisLabel}>Light Status: {lightOk ? "OK" : "FAIL"}</Text>
          <Text style={styles.analysisLabel}>RS485 Status: {modbusOk ? "OK" : "FAIL"}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.syncIndicator}>
          <View
            style={[
              styles.syncDot,
              { backgroundColor: isConnected ? "#4CAF50" : "#D32F2F" },
            ]}
          />
          <Text style={styles.footerText}>Last updated: {lastSync}</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.historyLink}>View History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#757575",
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F8F4",
    justifyContent: "center",
    alignItems: "center",
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 13,
    color: "#616161",
    fontWeight: "500",
  },
  healthCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  healthGradient: {
    padding: 20,
  },
  healthContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  healthLeft: {
    flex: 1,
  },
  healthLabel: {
    fontSize: 13,
    color: "#757575",
    fontWeight: "500",
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -1,
  },
  scoreMax: {
    fontSize: 18,
    color: "#9E9E9E",
    marginLeft: 4,
  },
  healthStatus: {
    fontSize: 14,
    color: "#616161",
    fontWeight: "500",
  },
  healthCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  sensorsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  sensorCardWrapper: {
    width: (width - 54) / 2,
  },
  sensorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  sensorInfo: {
    marginBottom: 12,
  },
  sensorLabel: {
    fontSize: 13,
    color: "#757575",
    marginBottom: 6,
    fontWeight: "500",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
    letterSpacing: -0.5,
  },
  sensorUnit: {
    fontSize: 14,
    color: "#9E9E9E",
    marginLeft: 4,
  },
  optimalText: {
    fontSize: 11,
    color: "#9E9E9E",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  analysisSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  analysisCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  analysisItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  analysisLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  analysisIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  analysisLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  analysisDescription: {
    fontSize: 12,
    color: "#757575",
    maxWidth: 180,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 16,
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  recommendationCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  warningCard: {
    backgroundColor: "#FFF8E1",
    borderLeftColor: "#F57C00",
  },
  criticalCard: {
    backgroundColor: "#E3F2FD",
    borderLeftColor: "#1976D2",
  },
  successCard: {
    backgroundColor: "#F1F8F4",
    borderLeftColor: "#2E7D32",
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: "#616161",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  syncIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  footerText: {
    fontSize: 13,
    color: "#9E9E9E",
  },
  historyLink: {
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "600",
  },
});