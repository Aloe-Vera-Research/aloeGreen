import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EnvironmentScreen() {
  // 🔧 Hard-coded IoT values (prototype)
  const temperature = 32; // °C
  const soilMoisture = 48; // %
  const humidity = 62; // %
  const rainfall = 3; // mm
  const lastSync = "Today • 10:42 AM";

  // 🔧 Simple rule-based status
  const heatStress = temperature > 35 ? "High" : "Normal";
  const waterStress = soilMoisture < 40 ? "Low Moisture" : "Optimal";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <Text style={styles.title}>Environment Status</Text>
      <Text style={styles.subtitle}>
        Live conditions from IoT sensors
      </Text>

      {/* Sensor Cards */}
      <View style={styles.grid}>

        <View style={styles.sensorCard}>
          <Ionicons name="sunny-outline" size={24} color="#EF6C00" />
          <Text style={styles.sensorLabel}>Temperature</Text>
          <Text style={styles.sensorValue}>{temperature} °C</Text>
        </View>

        <View style={styles.sensorCard}>
          <Ionicons name="water-outline" size={24} color="#1565C0" />
          <Text style={styles.sensorLabel}>Soil Moisture</Text>
          <Text style={styles.sensorValue}>{soilMoisture} %</Text>
        </View>

        <View style={styles.sensorCard}>
          <Ionicons name="cloud-outline" size={24} color="#546E7A" />
          <Text style={styles.sensorLabel}>Humidity</Text>
          <Text style={styles.sensorValue}>{humidity} %</Text>
        </View>

        <View style={styles.sensorCard}>
          <Ionicons name="rainy-outline" size={24} color="#2E7D32" />
          <Text style={styles.sensorLabel}>Rainfall</Text>
          <Text style={styles.sensorValue}>{rainfall} mm</Text>
        </View>

      </View>

      {/* Stress Analysis */}
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Stress Analysis</Text>

        <View style={styles.analysisRow}>
          <Text style={styles.analysisLabel}>Heat Stress</Text>
          <Text
            style={[
              styles.analysisValue,
              heatStress === "High" && styles.danger
            ]}
          >
            {heatStress}
          </Text>
        </View>

        <View style={styles.analysisRow}>
          <Text style={styles.analysisLabel}>Water Stress</Text>
          <Text
            style={[
              styles.analysisValue,
              waterStress !== "Optimal" && styles.warning
            ]}
          >
            {waterStress}
          </Text>
        </View>
      </View>

      {/* Alerts */}
      <View style={styles.alertCard}>
        <Ionicons name="alert-circle-outline" size={22} color="#EF6C00" />
        <Text style={styles.alertText}>
          Consider irrigation if soil moisture drops below 40%.
        </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        Last sensor update: {lastSync}
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#616161",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 24,
  },
  sensorCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    elevation: 2,
  },
  sensorLabel: {
    fontSize: 13,
    color: "#616161",
    marginTop: 6,
  },
  sensorValue: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  analysisCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1B5E20",
  },
  analysisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  analysisLabel: {
    fontSize: 14,
    color: "#424242",
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  warning: {
    color: "#EF6C00",
  },
  danger: {
    color: "#D32F2F",
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  alertText: {
    fontSize: 13,
    marginLeft: 8,
    color: "#E65100",
    flex: 1,
  },
  footerText: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
  },
});
