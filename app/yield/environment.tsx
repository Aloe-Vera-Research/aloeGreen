import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Animated,
  Dimensions 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function EnvironmentScreen() {
  // 🔧 Hard-coded IoT values (prototype)
  const temperature = 32; // °C
  const soilMoisture = 48; // %
  const humidity = 62; // %
  const rainfall = 3; // mm
  const lastSync = "Today • 10:42 AM";

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

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
  }, []);

  // Enhanced status calculations
  const getTemperatureStatus = () => {
    if (temperature > 35) return { level: "Critical", color: "#D32F2F", icon: "alert-circle" };
    if (temperature > 30) return { level: "Warning", color: "#F57C00", icon: "warning" };
    return { level: "Optimal", color: "#2E7D32", icon: "checkmark-circle" };
  };

  const getMoistureStatus = () => {
    if (soilMoisture < 30) return { level: "Critical", color: "#D32F2F", icon: "alert-circle" };
    if (soilMoisture < 40) return { level: "Low", color: "#F57C00", icon: "warning" };
    if (soilMoisture > 70) return { level: "High", color: "#1976D2", icon: "information-circle" };
    return { level: "Optimal", color: "#2E7D32", icon: "checkmark-circle" };
  };

  const getHumidityStatus = () => {
    if (humidity > 80) return { level: "High", color: "#1976D2", icon: "information-circle" };
    if (humidity < 40) return { level: "Low", color: "#F57C00", icon: "warning" };
    return { level: "Optimal", color: "#2E7D32", icon: "checkmark-circle" };
  };

  const tempStatus = getTemperatureStatus();
  const moistureStatus = getMoistureStatus();
  const humidityStatus = getHumidityStatus();

  // Calculate overall health score
  const calculateHealthScore = () => {
    let score = 100;
    if (temperature > 35) score -= 30;
    else if (temperature > 30) score -= 15;
    if (soilMoisture < 30) score -= 30;
    else if (soilMoisture < 40) score -= 15;
    if (humidity > 80 || humidity < 40) score -= 10;
    return Math.max(0, score);
  };

  const healthScore = calculateHealthScore();
  const healthColor = healthScore >= 80 ? "#2E7D32" : healthScore >= 60 ? "#F57C00" : "#D32F2F";

  const sensors = [
    {
      id: 1,
      label: "Temperature",
      value: temperature,
      unit: "°C",
      icon: "thermometer-outline",
      gradient: ["#FF6B35", "#F7931E"],
      status: tempStatus,
      optimal: "25-35°C",
      progress: Math.min(temperature / 40, 1),
    },
    {
      id: 2,
      label: "Soil Moisture",
      value: soilMoisture,
      unit: "%",
      icon: "water-outline",
      gradient: ["#4FC3F7", "#29B6F6"],
      status: moistureStatus,
      optimal: "40-70%",
      progress: soilMoisture / 100,
    },
    {
      id: 3,
      label: "Humidity",
      value: humidity,
      unit: "%",
      icon: "cloud-outline",
      gradient: ["#78909C", "#607D8B"],
      status: humidityStatus,
      optimal: "40-80%",
      progress: humidity / 100,
    },
    {
      id: 4,
      label: "Rainfall",
      value: rainfall,
      unit: "mm",
      icon: "rainy-outline",
      gradient: ["#66BB6A", "#43A047"],
      status: { level: "Today", color: "#546E7A", icon: "water" },
      optimal: "24h total",
      progress: Math.min(rainfall / 10, 1),
    },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Health Score */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Environment Monitor</Text>
            <Text style={styles.subtitle}>Real-time IoT sensor data</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} activeOpacity={0.7}>
            <Ionicons name="refresh" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* Health Score Card */}
        <Animated.View 
          style={[
            styles.healthCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
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
                  {healthScore >= 80 ? "Excellent Conditions" : 
                   healthScore >= 60 ? "Monitor Closely" : "Action Required"}
                </Text>
              </View>
              <View style={[styles.healthCircle, { borderColor: healthColor }]}>
                <Ionicons 
                  name={healthScore >= 80 ? "leaf" : 
                        healthScore >= 60 ? "alert-circle" : "warning"} 
                  size={32} 
                  color={healthColor} 
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Sensor Cards Grid */}
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
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [0, 30 + index * 10],
                    }),
                  }],
                },
              ]}
            >
              <TouchableOpacity style={styles.sensorCard} activeOpacity={0.9}>
                <LinearGradient
                  colors={sensor.gradient}
                  style={styles.iconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={sensor.icon} size={24} color="#FFFFFF" />
                </LinearGradient>

                <View style={styles.sensorInfo}>
                  <Text style={styles.sensorLabel}>{sensor.label}</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.sensorValue}>{sensor.value}</Text>
                    <Text style={styles.sensorUnit}>{sensor.unit}</Text>
                  </View>
                  <Text style={styles.optimalText}>Optimal: {sensor.optimal}</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${sensor.progress * 100}%`,
                        backgroundColor: sensor.status.color 
                      }
                    ]} 
                  />
                </View>

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: sensor.status.color + "15" }]}>
                  <Ionicons name={sensor.status.icon} size={12} color={sensor.status.color} />
                  <Text style={[styles.statusText, { color: sensor.status.color }]}>
                    {sensor.status.level}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Stress Analysis */}
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
                  {temperature > 35 ? "Provide shade & increase watering" : 
                   temperature > 30 ? "Monitor plant health" : "Temperature within range"}
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
              <View style={[styles.analysisIcon, { backgroundColor: moistureStatus.color + "15" }]}>
                <Ionicons name="water-outline" size={20} color={moistureStatus.color} />
              </View>
              <View>
                <Text style={styles.analysisLabel}>Water Stress</Text>
                <Text style={styles.analysisDescription}>
                  {soilMoisture < 30 ? "Immediate irrigation needed" :
                   soilMoisture < 40 ? "Schedule irrigation soon" : "Moisture levels adequate"}
                </Text>
              </View>
            </View>
            <View style={[styles.statusPill, { backgroundColor: moistureStatus.color + "15" }]}>
              <Text style={[styles.statusPillText, { color: moistureStatus.color }]}>
                {moistureStatus.level}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Smart Recommendations */}
      <View style={styles.recommendationsSection}>
        <Text style={styles.sectionTitle}>Smart Recommendations</Text>
        
        {temperature > 30 && (
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

        {soilMoisture < 40 && (
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

        {temperature <= 30 && soilMoisture >= 40 && (
          <View style={[styles.recommendationCard, styles.successCard]}>
            <View style={styles.recommendationIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Optimal Conditions</Text>
              <Text style={styles.recommendationText}>
                All environmental parameters are within ideal range. Continue current management practices.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.syncIndicator}>
          <View style={styles.syncDot} />
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