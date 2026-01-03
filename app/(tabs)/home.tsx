import { Link } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Yield & Forecasting</Text>
              <Text style={styles.cardSubtitle}>Predict Aloe Vera yield based on weather & soil.</Text>
            </View>
          </TouchableOpacity>
        {/* </Link> */}

        {/* Card 2: Disease Detection */}
        {/* <Link href="/detect" asChild>*/}
          <TouchableOpacity style={styles.card}>
            <Image source={require("../../assets/images/disease.png")} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Disease Detection</Text>
              <Text style={styles.cardSubtitle}>Scan leaf images and detect diseases using AI.</Text>
            </View>
          </TouchableOpacity>
        {/* </Link>  */}

        {/* Card 3: Fertilizer Plan */}
        <Link href="/fertilizer" asChild>
          <TouchableOpacity style={styles.card}>
            <Image source={require("../../assets/images/fertilizer.png")} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Fertilizer Plan</Text>
              <Text style={styles.cardSubtitle}>Get personalized fertilizer recommendations.</Text>
            </View>
          </TouchableOpacity>
        </Link> 

        {/* Card 4: Price Forecast */}
        {/* <Link href="/pricing" asChild> */}
          <TouchableOpacity style={styles.card}>
            <Image source={require("../../assets/images/price.webp")} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Price Forecast</Text>
              <Text style={styles.cardSubtitle}>Predict Aloe Vera leaf prices using market data.</Text>
            </View>
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
    paddingTop: 75,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 10,
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
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cardImage: {
    width: 70,
    height:70,
    borderRadius: 12,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#388E3C",
    lineHeight: 25,
  },
});