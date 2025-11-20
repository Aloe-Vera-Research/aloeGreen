import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.heading}>Welcome to Aloe Green</Text>
      <Text style={styles.subheading}>Smart Support System for Aloe Vera</Text>

      <View style={styles.cardsContainer}>
        {/* Card 1: Yield & Forecasting */}
        {/* <Link href="/yield" asChild> */}
          <TouchableOpacity style={styles.card}>
            <Image source={require("../../assets/images/yield.png")} style={styles.cardImage} />
            <Text style={styles.cardTitle}>Yield & Forecasting</Text>
            <Text style={styles.cardSubtitle}>Predict Aloe Vera yield based on weather & soil.</Text>
          </TouchableOpacity>
        {/* </Link> */}

        {/* Card 2: Disease Detection */}
        {/* <Link href="/detect" asChild>
          <TouchableOpacity style={styles.card}>
            <Image source={require("../../assets/images/disease.png")} style={styles.cardImage} />
            <Text style={styles.cardTitle}>Disease Detection</Text>
            <Text style={styles.cardSubtitle}>Scan leaf images and detect diseases using AI.</Text>
          </TouchableOpacity>
        </Link> */}

        {/* Card 3: Fertilizer Plan */}
        {/* <Link href="/fertilizer" asChild> */}
          <TouchableOpacity style={styles.card}>
            <Image source={require("../../assets/images/fertilizer.png")} style={styles.cardImage} />
            <Text style={styles.cardTitle}>Fertilizer Plan</Text>
            <Text style={styles.cardSubtitle}>Get personalized fertilizer recommendations.</Text>
          </TouchableOpacity>
        {/* </Link> */}

        {/* Card 4: Price Forecast */}
        {/* <Link href="/pricing" asChild> */}
          <TouchableOpacity style={styles.card}>
            <Image source={require("../../assets/images/price.webp")} style={styles.cardImage} />
            <Text style={styles.cardTitle}>Price Forecast</Text>
            <Text style={styles.cardSubtitle}>Predict Aloe Vera leaf prices using market data.</Text>
          </TouchableOpacity>
        {/* </Link> */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 20,
  },
  cardsContainer: {
    flexDirection: "column",
    gap: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 15,
  },
  cardImage: {
    width: "100%",
    height: 120,
    borderRadius: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#388E3C",
  },
});
