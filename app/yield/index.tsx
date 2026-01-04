import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";



export default function YieldDashboard() {
  // 🔧 Hard-coded prototype values
  const perPlantYield = 220; // grams
 const [plantCount, setPlantCount] = useState<number>(0);
const [plantAgeMonths, setPlantAgeMonths] = useState<number>(0);

  const totalYieldKg = ((perPlantYield * plantCount) / 1000).toFixed(1);

  // const plantAgeMonths = 6;
  const modelConfidence = 0.89;
  const lastUpdated = "Today • 10:45 AM";
  const router = useRouter();

  useEffect(() => {
  const loadFarmSetup = async () => {
    const data = await AsyncStorage.getItem("farmSetup");
    if (!data) return;

    const parsed = JSON.parse(data);

    // Plant count
    setPlantCount(parsed.plantCount);

    // Calculate plant age in months
    const plantingDate = new Date(parsed.plantingDate);
    const today = new Date();

    const diffMonths =
      (today.getFullYear() - plantingDate.getFullYear()) * 12 +
      (today.getMonth() - plantingDate.getMonth());

    setPlantAgeMonths(diffMonths);
  };

  loadFarmSetup();
}, []);



  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <Text style={styles.title}>Yield Dashboard</Text>
      <Text style={styles.subtitle}>
        Real-time Aloe Vera yield estimation
      </Text>

      {/* Main Yield Card */}
      <View style={styles.mainCard}>
        <Text style={styles.mainLabel}>Predicted Yield (per plant)</Text>
        <Text style={styles.mainValue}>{perPlantYield} g</Text>
        <Text style={styles.mainNote}>
          Based on current environmental conditions
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.row}>
        <View style={styles.infoCard}>
          <Ionicons name="leaf-outline" size={22} color="#2E7D32" />
          <Text style={styles.infoLabel}>Plant Age</Text>
          <Text style={styles.infoValue}>{plantAgeMonths} months</Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="stats-chart-outline" size={22} color="#1565C0" />
          <Text style={styles.infoLabel}>Model Accuracy</Text>
          <Text style={styles.infoValue}>
            {(modelConfidence * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Total Yield */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Estimated Total Yield</Text>
        <Text style={styles.totalValue}>{totalYieldKg} kg</Text>
        {plantCount > 0 && (
  <Text style={styles.totalNote}>
    Calculated using {plantCount} plants
  </Text>
)}

      </View>
      <TouchableOpacity
  onPress={() => router.push("/yield/farm-setup")}
  style={styles.editButton}
>
  <Text style={styles.editText}>Edit Farm Setup</Text>
</TouchableOpacity>

      <TouchableOpacity
  style={styles.navButton}
  onPress={() => router.push("/yield/environment")}
>
  <Text style={styles.navText}>View Environment</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.navButton}
  onPress={() => router.push("/yield/scenario")}
>
  <Text style={styles.navText}>Scenario Testing</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.navButton}
  onPress={() => router.push("/yield/history")}
>
  <Text style={styles.navText}>Yield History & Alerts</Text>
</TouchableOpacity>


      {/* Status */}
      <View style={styles.statusCard}>
        <Ionicons name="checkmark-circle-outline" size={22} color="#2E7D32" />
        <Text style={styles.statusText}>Crop Status: Healthy</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        Last updated: {lastUpdated}
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
  editButton: {
  marginTop: 16,
  backgroundColor: "#FFFFFF",
  borderRadius: 14,
  paddingVertical: 14,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#C8E6C9",
  elevation: 2,          // Android shadow
  shadowColor: "#000",   // iOS shadow
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
},

editText: {
  fontSize: 15,
  fontWeight: "600",
  color: "#1B5E20",
},

  subtitle: {
    fontSize: 14,
    color: "#616161",
    marginBottom: 20,
  },
  mainCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  navButton: {
  backgroundColor: "#FFFFFF",
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: "center",
  marginBottom: 12,
  elevation: 2,
},
navText: {
  fontSize: 16,
  fontWeight: "600",
  color: "#1B5E20",
},

  mainLabel: {
    fontSize: 15,
    color: "#2E7D32",
    marginBottom: 6,
  },
  mainValue: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  mainNote: {
    fontSize: 12,
    color: "#4E6E50",
    marginTop: 6,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    elevation: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: "#616161",
    marginTop: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 14,
    color: "#424242",
  },
  totalValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1B5E20",
    marginVertical: 6,
  },
  totalNote: {
    fontSize: 12,
    color: "#757575",
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#2E7D32",
    fontWeight: "600",
  },
  footerText: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
  },
});
