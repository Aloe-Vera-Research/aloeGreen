import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import mqtt, { MqttClient } from "mqtt";

const soilTypes = [
  {
    id: "Sandy",
    icon: "water-outline",
    description: "Fast draining, low nutrients",
  },
  {
    id: "Loamy",
    icon: "leaf-outline",
    description: "Balanced, ideal for most plants",
  },
  {
    id: "Clay",
    icon: "layers-outline",
    description: "Nutrient-rich, slower drainage",
  },
];

const plantStages = [
  {
    id: "Baby",
    icon: "flower-outline",
    description: "Early growth phase",
  },
  {
    id: "Mature",
    icon: "nutrition-outline",
    description: "Full development stage",
  },
  {
    id: "Damage Recovery",
    icon: "medkit-outline",
    description: "Healing and repair",
  },
];

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

const HIVEMQ_HOST = "5b19de651ec740d7a8b737f7c9bbf428.s1.eu.hivemq.cloud";
const HIVEMQ_PORT = 8884;
const MQTT_TOPIC = "aloeGreen/device01/data";
const MQTT_USERNAME = "eesara";
const MQTT_PASSWORD = "Eesara@123";

// Change only this if needed
const PREDICT_URL = "http://192.168.8.158:8000/api/fertilizer/predict";

export default function FertilizerScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [soil, setSoil] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);

  const [sensorData, setSensorData] = useState<SensorPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [predicting, setPredicting] = useState(false);

  const clientRef = useRef<MqttClient | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.95);

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

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

    const client = mqtt.connect(mqttUrl, {
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      clientId: `expo_fertilizer_${Math.random().toString(16).slice(2, 10)}`,
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
      console.log("MQTT reconnecting...");
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
        const parsed: SensorPayload = JSON.parse(message.toString());
        console.log("MQTT payload:", parsed);
        console.log("temperature_c:", parsed.temperature_c);
        console.log("humidity_pct:", parsed.humidity_pct);
        console.log("soil_ph:", parsed.soil_ph);
        console.log("nitrogen:", parsed.nitrogen);
        console.log("phosphorus:", parsed.phosphorus);
        console.log("potassium:", parsed.potassium);
        console.log("dht_ok:", parsed.dht_ok);
        console.log("modbus_ok:", parsed.modbus_ok);

        setSensorData(parsed);
      } catch (e) {
        console.log("Invalid MQTT payload:", e);
      }
    });
  };

  useEffect(() => {
    connectMqtt();
    return () => disconnectMqtt();
  }, []);

  const soilMoisturePercent = useMemo(() => {
    const raw = sensorData?.soil_moisture_raw ?? 0;
    const percent = ((4095 - raw) / 4095) * 100;
    return Math.max(0, Math.min(100, percent));
  }, [sensorData?.soil_moisture_raw]);

  const dhtOk =
    sensorData?.dht_ok ??
    (sensorData?.temperature_c != null && sensorData?.humidity_pct != null);

  const modbusOk =
    sensorData?.modbus_ok ??
    (sensorData?.soil_ph != null ||
      sensorData?.nitrogen != null ||
      sensorData?.phosphorus != null ||
      sensorData?.potassium != null);

  const temperature = dhtOk ? (sensorData?.temperature_c ?? 0) : 0;
  const humidity = dhtOk ? (sensorData?.humidity_pct ?? 0) : 0;

  const soilPH = modbusOk ? (sensorData?.soil_ph ?? 0) : 0;
  const nitrogen = modbusOk ? (sensorData?.nitrogen ?? 0) : 0;
  const phosphorus = modbusOk ? (sensorData?.phosphorus ?? 0) : 0;
  const potassium = modbusOk ? (sensorData?.potassium ?? 0) : 0;

  const getNPKLevel = (value: number) => {
    if (value >= 60) return "High";
    if (value >= 30) return "Medium";
    return "Low";
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3].map((stepNum) => (
        <View key={stepNum} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              step >= stepNum && styles.stepCircleActive,
              step === stepNum && styles.stepCircleCurrent,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                step >= stepNum && styles.stepNumberActive,
              ]}
            >
              {stepNum}
            </Text>
          </View>
          <Text style={styles.stepLabel}>
            {stepNum === 1 ? "Soil" : stepNum === 2 ? "Stage" : "Review"}
          </Text>
          {stepNum < 3 && (
            <View
              style={[
                styles.stepConnector,
                step > stepNum && styles.stepConnectorActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!soil || !stage) return;

    if (!sensorData) {
      Alert.alert("No Sensor Data", "Waiting for live MQTT sensor values.");
      return;
    }

    try {
      setPredicting(true);

      const payload = {
        Soil_pH: Number(soilPH || 0),
        N: Number(nitrogen || 0),
        P: Number(phosphorus || 0),
        K: Number(potassium || 0),
        Soil_Moisture: Number(soilMoisturePercent.toFixed(1)),
        Soil_Type: soil,
        Plant_Age_Category: stage,
        Application_Timing: "Morning",
        Additional_Advice: "Generated using live MQTT IoT sensor data",
      };

      console.log("PREDICT_URL:", PREDICT_URL);
      console.log("Prediction payload:", payload);

      const response = await fetch(PREDICT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Prediction status:", response.status);

      const rawText = await response.text();
      console.log("Prediction raw response:", rawText);

      if (!response.ok) {
        throw new Error(rawText || "Prediction request failed");
      }

      let prediction: any = null;
      try {
        prediction = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        console.log("Prediction JSON parse error:", parseError);
        throw new Error("Backend returned invalid JSON");
      }

      console.log("Prediction parsed:", prediction);

      router.push({
        pathname: "/fertilizer-management/plan",
        params: {
          soil,
          stage,
          temperature: String(Number(temperature).toFixed(1)),
          moisture: String(Math.round(soilMoisturePercent)),
          humidity: String(Number(humidity).toFixed(1)),
          soilPH: String(Number(soilPH).toFixed(1)),
          N: String(nitrogen),
          P: String(phosphorus),
          K: String(potassium),
          prediction: JSON.stringify(prediction),
        },
      });
    } catch (error: any) {
      console.log("Prediction error:", error);
      Alert.alert(
        "Prediction Error",
        error?.message || "Failed to generate fertilizer plan",
      );
    } finally {
      setPredicting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBackButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1B5E20" />
          </TouchableOpacity>
          <View style={styles.headerIconWrapper}>
            <Ionicons name="flask" size={32} color="#2E7D32" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Fertilizer Plan</Text>
            <Text style={styles.headerSubtitle}>
              Optimize your crop nutrition
            </Text>
          </View>
        </View>

        <View style={styles.connectionRow}>
          <View
            style={[
              styles.connectionDot,
              { backgroundColor: isConnected ? "#4CAF50" : "#D32F2F" },
            ]}
          />
          <Text style={styles.connectionText}>
            {isConnected ? "Connected to HiveMQ live feed" : "Disconnected"}
          </Text>
        </View>

        {renderStepIndicator()}

        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {step === 1 && (
            <>
              <View style={styles.cardHeader}>
                <Ionicons name="earth" size={28} color="#2E7D32" />
                <Text style={styles.cardTitle}>Select Soil Type</Text>
              </View>
              <Text style={styles.cardDescription}>
                Choose the soil type that best matches your farm
              </Text>

              <View style={styles.optionsContainer}>
                {soilTypes.map((item, index) => (
                  <Animated.View
                    key={item.id}
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateX: slideAnim.interpolate({
                            inputRange: [0, 30],
                            outputRange: [0, 30 + index * 10],
                          }),
                        },
                      ],
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.option,
                        soil === item.id && styles.optionSelected,
                      ]}
                      onPress={() => setSoil(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionIconWrapper}>
                        <Ionicons
                          name={item.icon as any}
                          size={32}
                          color={soil === item.id ? "#2E7D32" : "#4E6E4E"}
                        />
                      </View>
                      <View style={styles.optionContent}>
                        <Text
                          style={[
                            styles.optionTitle,
                            soil === item.id && styles.optionTitleSelected,
                          ]}
                        >
                          {item.id}
                        </Text>
                        <Text style={styles.optionDescription}>
                          {item.description}
                        </Text>
                      </View>
                      {soil === item.id && (
                        <View style={styles.checkmark}>
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#2E7D32"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.cardHeader}>
                <Ionicons name="analytics" size={28} color="#2E7D32" />
                <Text style={styles.cardTitle}>Select Plant Stage</Text>
              </View>
              <Text style={styles.cardDescription}>
                What stage are your Aloe Vera plants in?
              </Text>

              <View style={styles.optionsContainer}>
                {plantStages.map((item, index) => (
                  <Animated.View
                    key={item.id}
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateX: slideAnim.interpolate({
                            inputRange: [0, 30],
                            outputRange: [0, 30 + index * 10],
                          }),
                        },
                      ],
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.option,
                        stage === item.id && styles.optionSelected,
                      ]}
                      onPress={() => setStage(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionIconWrapper}>
                        <Ionicons
                          name={item.icon as any}
                          size={32}
                          color={stage === item.id ? "#2E7D32" : "#4E6E4E"}
                        />
                      </View>
                      <View style={styles.optionContent}>
                        <Text
                          style={[
                            styles.optionTitle,
                            stage === item.id && styles.optionTitleSelected,
                          ]}
                        >
                          {item.id}
                        </Text>
                        <Text style={styles.optionDescription}>
                          {item.description}
                        </Text>
                      </View>
                      {stage === item.id && (
                        <View style={styles.checkmark}>
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#2E7D32"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <View style={styles.cardHeader}>
                <Ionicons name="hardware-chip" size={28} color="#2E7D32" />
                <Text style={styles.cardTitle}>Live Environmental Data</Text>
              </View>
              <Text style={styles.cardDescription}>
                Review current IoT readings before prediction
              </Text>

              <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Soil Type</Text>
                  <Text style={styles.summaryValue}>{soil}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Plant Stage</Text>
                  <Text style={styles.summaryValue}>{stage}</Text>
                </View>
              </View>

              {!sensorData ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2E7D32" />
                  <Text style={styles.loadingText}>
                    Waiting for MQTT sensor values...
                  </Text>
                </View>
              ) : (
                <View style={styles.iotDataContainer}>
                  <Text style={styles.sectionTitle}>IoT Sensor Readings</Text>

                  <View style={styles.dataGrid}>
                    {[
                      {
                        icon: "thermometer",
                        label: "Temperature",
                        value: dhtOk
                          ? `${Number(temperature).toFixed(1)}°C`
                          : "--",
                      },
                      {
                        icon: "water",
                        label: "Moisture",
                        value: `${Math.round(soilMoisturePercent)}%`,
                      },
                      {
                        icon: "beaker",
                        label: "Soil pH",
                        value: modbusOk ? Number(soilPH).toFixed(1) : "--",
                      },
                      {
                        icon: "cloud",
                        label: "Humidity",
                        value: dhtOk ? `${Number(humidity).toFixed(1)}%` : "--",
                      },
                    ].map((item, index) => (
                      <View key={index} style={styles.dataCard}>
                        <View style={styles.dataIconWrapper}>
                          <Ionicons
                            name={item.icon as any}
                            size={24}
                            color="#2E7D32"
                          />
                        </View>
                        <Text style={styles.dataLabel}>{item.label}</Text>
                        <Text style={styles.dataValue}>{item.value}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.sectionTitle}>NPK Levels</Text>
                  <View style={styles.npkContainer}>
                    {[
                      {
                        label: "Nitrogen (N)",
                        value: nitrogen,
                        color: "#4CAF50",
                      },
                      {
                        label: "Phosphorus (P)",
                        value: phosphorus,
                        color: "#FF9800",
                      },
                      {
                        label: "Potassium (K)",
                        value: potassium,
                        color: "#2196F3",
                      },
                    ].map((item, index) => {
                      const level = getNPKLevel(item.value);
                      return (
                        <View key={index} style={styles.npkItem}>
                          <View style={styles.npkHeader}>
                            <Text style={styles.npkLabel}>{item.label}</Text>
                            <View
                              style={[
                                styles.npkBadge,
                                {
                                  backgroundColor:
                                    level === "High"
                                      ? "#4CAF50"
                                      : level === "Medium"
                                        ? "#FF9800"
                                        : "#F44336",
                                },
                              ]}
                            >
                              <Text style={styles.npkValue}>{item.value}</Text>
                            </View>
                          </View>
                          <View style={styles.npkBar}>
                            <View
                              style={[
                                styles.npkBarFill,
                                {
                                  width: `${Math.min(Math.max(item.value, 0), 100)}%`,
                                  backgroundColor: item.color,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}
        </Animated.View>

        <View style={styles.buttonContainer}>
          {step > 1 ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#2E7D32" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="home" size={20} color="#2E7D32" />
              <Text style={styles.homeButtonText}>Home</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              (step === 1 && !soil) || (step === 2 && !stage)
                ? styles.buttonDisabled
                : null,
            ]}
            disabled={
              (step === 1 && !soil) || (step === 2 && !stage) || predicting
            }
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                (step === 1 && !soil) || (step === 2 && !stage)
                  ? ["#9E9E9E", "#757575"]
                  : ["#2E7D32", "#1B5E20"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              {predicting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>
                    {step < 3 ? "Continue" : "View Plan"}
                  </Text>
                  <Ionicons
                    name={step < 3 ? "arrow-forward" : "document-text"}
                    size={20}
                    color="#fff"
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  headerBackButton: {
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
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#1B5E20" },
  headerSubtitle: { fontSize: 14, color: "#2E7D32", fontWeight: "500" },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  connectionDot: { width: 8, height: 8, borderRadius: 4 },
  connectionText: { fontSize: 13, color: "#616161", fontWeight: "500" },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  stepItem: { flex: 1, alignItems: "center", position: "relative" },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#C8E6C9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  stepCircleActive: { borderColor: "#2E7D32", backgroundColor: "#E8F5E9" },
  stepCircleCurrent: { backgroundColor: "#2E7D32" },
  stepNumber: { fontSize: 16, fontWeight: "700", color: "#9E9E9E" },
  stepNumberActive: { color: "#FFFFFF" },
  stepLabel: { fontSize: 12, color: "#4E6E4E", fontWeight: "600" },
  stepConnector: {
    position: "absolute",
    top: 20,
    left: "60%",
    right: "-60%",
    height: 2,
    backgroundColor: "#C8E6C9",
    zIndex: -1,
  },
  stepConnectorActive: { backgroundColor: "#2E7D32" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: "700", color: "#1B5E20" },
  cardDescription: {
    fontSize: 14,
    color: "#4E6E4E",
    marginBottom: 20,
    lineHeight: 20,
  },
  optionsContainer: { gap: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: { backgroundColor: "#E8F5E9", borderColor: "#2E7D32" },
  optionIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionContent: { flex: 1 },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 2,
  },
  optionTitleSelected: { color: "#2E7D32" },
  optionDescription: { fontSize: 13, color: "#4E6E4E" },
  checkmark: { marginLeft: 8 },
  summaryContainer: { flexDirection: "row", gap: 12, marginBottom: 20 },
  summaryItem: {
    flex: 1,
    backgroundColor: "#F1F8F4",
    borderRadius: 12,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#4E6E4E",
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryValue: { fontSize: 16, fontWeight: "700", color: "#2E7D32" },
  iotDataContainer: { gap: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 12,
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  dataCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  dataIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 12,
    color: "#4E6E4E",
    fontWeight: "600",
    marginBottom: 4,
  },
  dataValue: { fontSize: 18, fontWeight: "700", color: "#2E7D32" },
  npkContainer: { gap: 14 },
  npkItem: { backgroundColor: "#F8F9FA", borderRadius: 12, padding: 14 },
  npkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  npkLabel: { fontSize: 14, fontWeight: "600", color: "#1B5E20" },
  npkBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  npkValue: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  npkBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  npkBarFill: { height: "100%", borderRadius: 4 },
  buttonContainer: { flexDirection: "row", gap: 12 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: { color: "#2E7D32", fontSize: 15, fontWeight: "700" },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  homeButtonText: { color: "#2E7D32", fontSize: 15, fontWeight: "700" },
  nextButton: {
    flex: 2,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: { shadowOpacity: 0.1 },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  nextButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#4E6E4E",
    fontWeight: "500",
  },
});
