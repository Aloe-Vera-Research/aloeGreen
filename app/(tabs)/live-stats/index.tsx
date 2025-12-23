import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useEffect, useState } from "react";

type Stat = {
  label: string;
  value: string;
  unit: string;
};

export default function LiveStats() {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    const updateStats = () => {
      setStats([
        { label: "Temperature", value: (28 + Math.random() * 4).toFixed(1), unit: "°C" },
        { label: "Humidity", value: (60 + Math.random() * 10).toFixed(0), unit: "%" },
        { label: "Soil Moisture", value: (45 + Math.random() * 10).toFixed(0), unit: "%" },
        { label: "Soil pH", value: (6 + Math.random()).toFixed(1), unit: "" },
        { label: "Rainfall", value: (Math.random() * 5).toFixed(1), unit: "mm" },
      ]);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>🌱 Live Farm Stats</Text>
      <Text style={styles.subtitle}>Real-time environmental monitoring</Text>

      <View style={styles.grid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.label}>{stat.label}</Text>
            <Text style={styles.value}>
              {stat.value}
              <Text style={styles.unit}> {stat.unit}</Text>
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    paddingTop: 70,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 3,
  },

  label: {
    fontSize: 14,
    color: "#388E3C",
  },

  value: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B5E20",
    marginTop: 6,
  },

  unit: {
    fontSize: 14,
    fontWeight: "normal",
    color: colorTogglePlatform("#2E7D32", "#388E3C"),
  },
});

// small helper (optional)
function colorTogglePlatform(ios: string, android: string) {
  return Platform.OS === "ios" ? ios : android;
}
