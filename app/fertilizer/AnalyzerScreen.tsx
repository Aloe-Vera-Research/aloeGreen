import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";

export default function AnalyzerScreen() {
  const screenWidth = Dimensions.get("window").width - 32; // padding

  // Example fertilizer usage data per week
  const usageData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        data: [20, 25, 18, 30], // fertilizer dosage in grams
        color: (opacity = 1) => `rgba(46,125,50, ${opacity})`, // line color
      },
    ],
  };

  // Example AI recommendation
  const aiRecommendation = [
    { week: "Week 1", advice: "Increase N dose slightly." },
    { week: "Week 2", advice: "Maintain P & K dosage." },
    { week: "Week 3", advice: "Reduce N slightly, check soil moisture." },
    {
      week: "Week 4",
      advice: "Keep balanced application, monitor plant growth.",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <Text style={styles.heading}>Fertilizer Usage Analyzer</Text>

      {/* Line Chart for Usage */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart-outline" size={24} color="#2E7D32" />
          <Text style={styles.cardTitle}>Weekly Fertilizer Usage (grams)</Text>
        </View>
        <LineChart
          data={usageData}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#E8F5E9",
            backgroundGradientTo: "#E8F5E9",
            color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            strokeWidth: 2,
            decimalPlaces: 0,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#2E7D32",
            },
          }}
          bezier
          style={{ borderRadius: 16 }}
        />
      </View>

      {/* AI Recommendations */}
      <Text style={styles.subheading}>AI Recommendations</Text>
      {aiRecommendation.map((item, index) => (
        <View key={index} style={styles.aiCard}>
          <Text style={styles.aiWeek}>{item.week}</Text>
          <Text style={styles.aiAdvice}>{item.advice}</Text>
        </View>
      ))}

      {/* Bar Chart Example for N/P/K */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="analytics-outline" size={24} color="#2E7D32" />
          <Text style={styles.cardTitle}>N / P / K Levels</Text>
        </View>
        <BarChart
          data={{
            labels: ["N", "P", "K"],
            datasets: [{ data: [30, 20, 40] }],
          }}
          width={screenWidth}
          height={200}
          yAxisLabel="" // <- Add this
          yAxisSuffix="%" // Optional, keep if you want %
          chartConfig={{
            backgroundGradientFrom: "#E8F5E9",
            backgroundGradientTo: "#E8F5E9",
            color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            barPercentage: 0.5,
          }}
          style={{ borderRadius: 16 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F8E9",
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 16,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
    marginVertical: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  aiCard: {
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  aiWeek: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1B5E20",
    marginBottom: 6,
  },
  aiAdvice: {
    fontSize: 14,
    color: "#2E7D32",
    lineHeight: 20,
  },
});
