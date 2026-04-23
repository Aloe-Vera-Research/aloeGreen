import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Landing() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/icon.png")} style={styles.logo} />
      <Text style={styles.title}>Aloe Green</Text>
      <Text style={styles.subtitle}>Smart Support System for Aloe Vera</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/language")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  subtitle: {
    fontSize: 16,
    color: "#2E7D32",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});