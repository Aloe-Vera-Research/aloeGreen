import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Language() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please Select Your Language</Text>
      <View style={styles.options}>
        <TouchableOpacity style={styles.option}><Text style={styles.optionText}>English</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text style={styles.optionText}>සිංහල</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text style={styles.optionText}>தமிழ்</Text></TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.push("/(tabs)/home")}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E8F5E9", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, color: "#1B5E20", textAlign: "center" },
  options: { width: "100%", gap: 15, marginBottom: 40 },
  option: { padding: 15, backgroundColor: "#fff", borderRadius: 12, alignItems: "center", shadowColor: "#000", shadowOffset: {width:0,height:2}, shadowOpacity:0.1, elevation:3 },
  optionText: { fontSize: 18, color: "#2E7D32" },
  nextButton: { backgroundColor: "#2E7D32", paddingVertical: 16, paddingHorizontal: 50, borderRadius: 14 },
  nextButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
