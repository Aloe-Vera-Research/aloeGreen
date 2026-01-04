import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FertilizerPlanScreen() {
     const router = useRouter();
  // Example data (you can replace with API)
 

  const recommendedFertilizers = [
    { type: "Urea", dosage: "20g per plant", timing: "Morning" },
    { type: "DAP", dosage: "15g per plant", timing: "Evening" },
    { type: "Potash", dosage: "10g per plant", timing: "Morning" },
  ];

  const [adviceText, setAdviceText] = useState(
    "Apply fertilizers based on plant stage and soil type. Always water after application."
  );

  // Speak advice
  const speakAdvice = () => {
    Speech.speak(adviceText, { language: "en" });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <Text style={styles.heading}>Fertilizer Plan</Text>

      {/* Fertilizer Recommendations */}
      <Text style={styles.subheading}>Recommended Fertilizers</Text>
      {recommendedFertilizers.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="leaf-outline" size={24} color="#2E7D32" />
            <Text style={styles.cardTitle}>{item.type}</Text>
          </View>
          <Text style={styles.cardText}>Dosage: {item.dosage}</Text>
          <Text style={styles.cardText}>Application: {item.timing}</Text>
        </View>
      ))}

      {/* AI Advice */}
      <View style={[styles.card, { backgroundColor: "#E8F5E9" }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="smart-toy" size={24} color="#1B5E20" />
          <Text style={styles.cardTitle}>AI Advice</Text>
        </View>
        <Text style={styles.cardText}>{adviceText}</Text>

        {/* Speak Button */}
        <TouchableOpacity style={styles.speakButton} onPress={speakAdvice}>
          <Ionicons name="volume-high-outline" size={20} color="#fff" />
          <Text style={styles.speakButtonText}>Hear Advice</Text>
        </TouchableOpacity>
      </View>

      {/* Extra Features Section */}
     <TouchableOpacity
  style={styles.extraFeature}
  onPress={() => router.push("/fertilizer-management/AnalyzerScreen")} 
>
  <Ionicons name="analytics-outline" size={24} color="#1B5E20" />
  <Text style={styles.extraFeatureText}>
    Track fertilizer usage and get AI recommendations per week.
  </Text>
</TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9", // softer background for eyes
    padding: 20,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1B5E20",
    textAlign: "center",
    marginTop: 30,
  },
  subheading: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2E7D32",
    marginVertical: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20, // slightly larger radius for modern feel
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5, // better shadow depth for Android
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B5E20",
  },
  cardText: {
    fontSize: 15,
    color: "#388E3C",
    lineHeight: 22, // better readability
    marginVertical: 3,
  },
  speakButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#388E3C", // slightly brighter green
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  speakButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  extraFeature: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCF8C6", // softer green highlight
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
    gap: 12,
  },
  extraFeatureText: {
    fontSize: 15,
    color: "#1B5E20",
    flex: 1,
    lineHeight: 22,
  },
});
