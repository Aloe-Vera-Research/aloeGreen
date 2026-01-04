import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";


export default function YieldHistoryScreen() {
  // 🔧 Hard-coded daily average yields (grams per plant)
  const dailyYield = [
    { x: "Mon", y: 210 },
    { x: "Tue", y: 215 },
    { x: "Wed", y: 218 },
    { x: "Thu", y: 220 },
    { x: "Fri", y: 222 },
    { x: "Sat", y: 219 },
    { x: "Sun", y: 221 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Header */}
      <Text style={styles.title}>Yield History</Text>
      <Text style={styles.subtitle}>
        Daily average yield predictions
      </Text>

      {/* Chart */}
      {/* History List */}
<View style={styles.chartCard}>
  <Text style={{ fontWeight: "600", marginBottom: 12, color: "#1B5E20" }}>
    Last 7 Days – Avg Yield (per plant)
  </Text>

  {dailyYield.map((d) => (
    <View
      key={d.x}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderColor: "#E0E0E0",
      }}
    >
      <Text style={{ color: "#424242" }}>{d.x}</Text>
      <Text style={{ fontWeight: "600", color: "#1B5E20" }}>
        {d.y} g
      </Text>
    </View>
  ))}
</View>


      {/* Insight */}
      <View style={styles.insightCard}>
        <Ionicons name="analytics-outline" size={22} color="#2E7D32" />
        <Text style={styles.insightText}>
          Yield has remained stable over the past week with a slight upward trend.
        </Text>
      </View>

      {/* Alerts */}
      <Text style={styles.sectionTitle}>Alerts & Recommendations</Text>

      <View style={styles.alertCard}>
        <Ionicons name="alert-circle-outline" size={22} color="#EF6C00" />
        <Text style={styles.alertText}>
          Soil moisture is approaching the lower threshold. Consider irrigation.
        </Text>
      </View>

      <View style={styles.alertCardGreen}>
        <Ionicons name="checkmark-circle-outline" size={22} color="#2E7D32" />
        <Text style={styles.alertTextGreen}>
          Environmental conditions are suitable for harvesting this week.
        </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Predictions are updated automatically based on sensor data.
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
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    elevation: 2,
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  insightText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#2E7D32",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B5E20",
    marginBottom: 10,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  alertText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#E65100",
    flex: 1,
  },
  alertCardGreen: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  alertTextGreen: {
    marginLeft: 8,
    fontSize: 13,
    color: "#2E7D32",
    flex: 1,
  },
  footer: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
  },
});
