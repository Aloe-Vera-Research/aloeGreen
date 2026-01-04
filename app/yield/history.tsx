import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function YieldHistoryScreen() {
  const [timeRange, setTimeRange] = useState("week");

  const dailyYield = [
    { x: "Mon", y: 210, change: "+2%" },
    { x: "Tue", y: 215, change: "+2.4%" },
    { x: "Wed", y: 218, change: "+1.4%" },
    { x: "Thu", y: 220, change: "+0.9%" },
    { x: "Fri", y: 222, change: "+0.9%" },
    { x: "Sat", y: 219, change: "-1.4%" },
    { x: "Sun", y: 221, change: "+0.9%" },
  ];

  const maxYield = Math.max(...dailyYield.map(d => d.y));
  const minYield = Math.min(...dailyYield.map(d => d.y));
  const avgYield = (dailyYield.reduce((sum, d) => sum + d.y, 0) / dailyYield.length).toFixed(0);

  const alerts = [
    {
      type: "warning",
      icon: "water",
      color: "#FF9800",
      bg: "#FFF3E0",
      text: "Soil moisture approaching lower threshold - consider irrigation within 24h",
      priority: "Medium"
    },
    {
      type: "success",
      icon: "checkmark-circle",
      color: "#4CAF50",
      bg: "#E8F5E9",
      text: "Optimal harvesting conditions detected for this week",
      priority: "Low"
    },
    {
      type: "info",
      icon: "sunny",
      color: "#2196F3",
      bg: "#E3F2FD",
      text: "Temperature slightly above average - monitor heat stress indicators",
      priority: "Low"
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Yield History</Text>
            <Text style={styles.subtitle}>Track performance over time</Text>
          </View>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeSelector}>
          {["week", "month", "year"].map(range => (
            <TouchableOpacity
              key={range}
              style={[styles.timeButton, timeRange === range && styles.timeButtonActive]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[styles.timeButtonText, timeRange === range && styles.timeButtonTextActive]}>
                {range === "week" ? "7 Days" : range === "month" ? "30 Days" : "Year"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{avgYield}g</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statBadge}>
              <Ionicons name="trending-up" size={14} color="#4CAF50" />
              <Text style={[styles.statLabel, { color: "#4CAF50" }]}>Peak</Text>
            </View>
            <Text style={styles.statValue}>{maxYield}g</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statBadge}>
              <Ionicons name="trending-down" size={14} color="#FF9800" />
              <Text style={[styles.statLabel, { color: "#FF9800" }]}>Low</Text>
            </View>
            <Text style={styles.statValue}>{minYield}g</Text>
          </View>
        </View>

        {/* Chart Visualization */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Daily Yield Trend</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Per Plant (g)</Text>
            </View>
          </View>

          <View style={styles.chart}>
            {dailyYield.map((d, i) => {
              const height = ((d.y - minYield) / (maxYield - minYield)) * 120 + 40;
              const isHighest = d.y === maxYield;
              
              return (
                <View key={d.x} style={styles.chartBar}>
                  <Text style={[styles.changeText, { color: d.change.includes('+') ? '#4CAF50' : '#FF9800' }]}>
                    {d.change}
                  </Text>
                  <View style={styles.barWrapper}>
                    <LinearGradient
                      colors={isHighest ? ['#4CAF50', '#2E7D32'] : ['#81C784', '#66BB6A']}
                      style={[styles.bar, { height }]}
                    >
                      {isHighest && (
                        <View style={styles.peakBadge}>
                          <Ionicons name="star" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </LinearGradient>
                  </View>
                  <Text style={styles.barValue}>{d.y}</Text>
                  <Text style={styles.barLabel}>{d.x}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Key Insights */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb" size={24} color="#F9A825" />
            <Text style={styles.insightTitle}>Key Insight</Text>
          </View>
          <Text style={styles.insightText}>
            Yield improved by <Text style={styles.insightBold}>5.2%</Text> this week. 
            Consistent upward trend suggests optimal growing conditions. 
            Peak performance on <Text style={styles.insightBold}>Friday</Text> with 222g per plant.
          </Text>
        </View>

        {/* Alerts Section */}
        <View style={styles.alertsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alerts & Recommendations</Text>
            <View style={styles.alertCount}>
              <Text style={styles.alertCountText}>{alerts.length}</Text>
            </View>
          </View>

          {alerts.map((alert, index) => (
            <View key={index} style={[styles.alertCard, { backgroundColor: alert.bg }]}>
              <View style={[styles.alertIconWrapper, { backgroundColor: alert.color + '20' }]}>
                <Ionicons name={alert.icon} size={22} color={alert.color} />
              </View>
              <View style={styles.alertContent}>
                <View style={styles.alertTop}>
                  <Text style={[styles.alertText, { color: alert.color }]}>{alert.text}</Text>
                  <View style={[styles.priorityBadge, { 
                    backgroundColor: alert.priority === 'Medium' ? '#FF9800' : '#BDBDBD' 
                  }]}>
                    <Text style={styles.priorityText}>{alert.priority}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Footer Info */}
        <View style={styles.footerCard}>
          <Ionicons name="information-circle-outline" size={18} color="#9E9E9E" />
          <Text style={styles.footerText}>
            Predictions update automatically based on real-time sensor data and ML models
          </Text>
        </View>
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
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#757575",
    fontWeight: "500",
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  timeSelector: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  timeButtonActive: {
    backgroundColor: "#2E7D32",
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  timeButtonTextActive: {
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "600",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#212121",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
  },
  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  legendText: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    paddingTop: 20,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  changeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  barWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  bar: {
    width: 28,
    borderRadius: 8,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 4,
  },
  peakBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  barValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#212121",
  },
  barLabel: {
    fontSize: 11,
    color: "#9E9E9E",
    fontWeight: "600",
  },
  insightCard: {
    backgroundColor: "#FFFBEA",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#F9A825",
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
  },
  insightText: {
    fontSize: 14,
    color: "#616161",
    lineHeight: 20,
  },
  insightBold: {
    fontWeight: "700",
    color: "#212121",
  },
  alertsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
  },
  alertCount: {
    backgroundColor: "#F44336",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  alertCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  alertCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    gap: 12,
  },
  alertIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: "#757575",
    lineHeight: 18,
  },
});