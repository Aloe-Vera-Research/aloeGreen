import { View, Text, StyleSheet, Image, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F2F8F2" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <Text style={styles.title}>Smart Support System for Aloe Vera</Text>
        <Text style={styles.text}>
          This mobile research application provides a comprehensive AI-powered solution for Aloe Vera
          farmers. It combines disease detection, yield forecasting, fertilizer recommendations, and
          price prediction to help farmers make informed decisions and improve crop productivity.
        </Text>

        {/* 4 Sub-Modules */}
        <Text style={[styles.subTitle, { marginTop: 30 }]}>Our Core Modules</Text>
        <View style={styles.moduleContainer}>
          <Text style={styles.moduleTitle}>1. Yield & Forecasting Prediction</Text>
          <Text style={styles.moduleText}>
            Predict Aloe Vera yield using weather patterns, soil data, and seasonal trends.
          </Text>

          <Text style={styles.moduleTitle}>2. Disease Detection</Text>
          <Text style={styles.moduleText}>
            Detect diseases using leaf images and farmer-reported symptoms.
          </Text>

          <Text style={styles.moduleTitle}>3. Fertilizer Plan Recommendation</Text>
          <Text style={styles.moduleText}>
            Personalized fertilizer plans based on plant age, soil nutrients, and season.
          </Text>

          <Text style={styles.moduleTitle}>4. Price Forecasting</Text>
          <Text style={styles.moduleText}>
            Predict market prices for Aloe Vera leaves based on regional and historical data.
          </Text>
        </View>

        {/* Meet Our Developers */}
        <Text style={[styles.subTitle, { marginTop: 30 }]}>Meet Our Team</Text>
        <View style={styles.teamContainer}>
          {/* Tech Lead */}
          <View style={styles.member}>
            <Image source={require("../../assets/images/eesara.jpg")} style={styles.memberImage} />
            <Text style={styles.memberName}>Eesara Megasooriya</Text>
            <Text style={styles.memberRole}>Tech Lead</Text>
          </View>

          {/* Senior Developer */}
          <View style={styles.member}>
            <Image source={require("../../assets/images/himash.jpg")} style={styles.memberImage} />
            <Text style={styles.memberName}>Himash Rajapaksha</Text>
            <Text style={styles.memberRole}>Senior Developer</Text>
          </View>

          {/* QA Lead */}
          <View style={styles.member}>
            <Image source={require("../../assets/images/shehani.jpg")} style={styles.memberImage} />
            <Text style={styles.memberName}>Shehani Samarathunga</Text>
            <Text style={styles.memberRole}>QA Lead</Text>
          </View>

          {/* Senior Business Analyst */}
          <View style={styles.member}>
            <Image source={require("../../assets/images/amanda.jpg")} style={styles.memberImage} />
            <Text style={styles.memberName}>Amanda Bandara</Text>
            <Text style={styles.memberRole}>Senior Business Analyst</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 10 : 0,
    paddingHorizontal: 20,
    backgroundColor: "#F2F8F2",
  },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 15, color: "#1B5E20", textAlign: "left" },
  text: { fontSize: 16, color: "#444", lineHeight: 22 },

  subTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32", marginBottom: 10 },

  moduleContainer: { marginBottom: 20 },
  moduleTitle: { fontSize: 16, fontWeight: "bold", marginTop: 10, color: "#1B5E20" },
  moduleText: { fontSize: 14, color: "#444", marginTop: 2 },

  teamContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  member: {
    width: "48%",
    alignItems: "center",
    marginVertical: 15,
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  memberImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  memberName: { fontSize: 15, fontWeight: "bold", textAlign: "center", color: "#1B5E20" },
  memberRole: { fontSize: 13, color: "#555", textAlign: "center" },
});
