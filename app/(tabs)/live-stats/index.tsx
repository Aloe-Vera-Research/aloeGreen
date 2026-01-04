import { View, Text, StyleSheet, ScrollView, Platform, Animated } from "react-native";
import { useEffect, useState, useRef } from "react";

type Stat = {
  label: string;
  value: string;
  unit: string;
  icon: string;
  trend: "up" | "down" | "stable";
  color: string;
};

export default function LiveStats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const updateStats = () => {
      // Subtle fade animation on update
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const temp = 28 + Math.random() * 4;
      const humidity = 60 + Math.random() * 10;
      const moisture = 45 + Math.random() * 10;
      const ph = 6 + Math.random();
      const rainfall = Math.random() * 5;

      setStats([
        {
          label: "Temperature",
          value: temp.toFixed(1),
          unit: "°C",
          icon: "🌡️",
          trend: temp > 30 ? "up" : temp < 29 ? "down" : "stable",
          color: "#FF6B6B",
        },
        {
          label: "Humidity",
          value: humidity.toFixed(0),
          unit: "%",
          icon: "💧",
          trend: humidity > 65 ? "up" : humidity < 62 ? "down" : "stable",
          color: "#4ECDC4",
        },
        {
          label: "Soil Moisture",
          value: moisture.toFixed(0),
          unit: "%",
          icon: "🌾",
          trend: moisture > 50 ? "up" : moisture < 47 ? "down" : "stable",
          color: "#95E1D3",
        },
        {
          label: "Soil pH",
          value: ph.toFixed(1),
          unit: "",
          icon: "⚗️",
          trend: "stable",
          color: "#F38181",
        },
        {
          label: "Rainfall",
          value: rainfall.toFixed(1),
          unit: "mm",
          icon: "🌧️",
          trend: rainfall > 3 ? "up" : "stable",
          color: "#5B9BD5",
        },
        {
          label: "Air Quality",
          value: (85 + Math.random() * 10).toFixed(0),
          unit: "AQI",
          icon: "🍃",
          trend: "stable",
          color: "#A8E6CF",
        },
      ]);
      setLastUpdate(new Date());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return "↗";
    if (trend === "down") return "↘";
    return "→";
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Farm Dashboard</Text>
          <Text style={styles.subtitle}>Real-time Environmental Monitoring</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              Live • Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <Animated.View style={[styles.grid, { opacity: fadeAnim }]}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.icon}>{stat.icon}</Text>
                <View style={[styles.trendBadge, { backgroundColor: stat.color + '20' }]}>
                  <Text style={[styles.trendIcon, { color: stat.color }]}>
                    {getTrendIcon(stat.trend)}
                  </Text>
                </View>
              </View>
              <Text style={styles.label}>{stat.label}</Text>
              <View style={styles.valueContainer}>
                <Text style={[styles.value, { color: stat.color }]}>
                  {stat.value}
                </Text>
                {stat.unit && <Text style={styles.unit}>{stat.unit}</Text>}
              </View>
              <View style={[styles.colorBar, { backgroundColor: stat.color }]} />
            </View>
          ))}
        </Animated.View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            📊 Data refreshes every 5 seconds
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 16,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    fontSize: 28,
  },
  trendBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  trendIcon: {
    fontSize: 14,
    fontWeight: "bold",
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "600",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
    marginLeft: 4,
  },
  colorBar: {
    height: 3,
    borderRadius: 2,
    marginTop: 12,
    width: "40%",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});