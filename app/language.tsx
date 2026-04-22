import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Language() {
  const router = useRouter();
  const [selected, setSelected] = useState("English");

  const languages = [
    { label: "English", locked: false },
    { label: "සිංහල", locked: true },
    { label: "தமிழ்", locked: true },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please Select Your Language</Text>
      <View style={styles.options}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.label}
            style={[
              styles.option,
              selected === lang.label && styles.optionSelected,
              lang.locked && styles.optionLocked,
            ]}
            onPress={() => !lang.locked && setSelected(lang.label)}
            disabled={lang.locked}
          >
            <Text
              style={[
                styles.optionText,
                lang.locked && styles.optionTextLocked,
                selected === lang.label && styles.optionTextSelected,
              ]}
            >
              {lang.label}
            </Text>
            {lang.locked && (
              <Text style={styles.lockIcon}>🔒</Text>
            )}
          </TouchableOpacity>
        ))}
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
  option: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  optionSelected: {
    backgroundColor: "#2E7D32",
    borderWidth: 2,
    borderColor: "#1B5E20",
  },
  optionLocked: {
    backgroundColor: "#F5F5F5",
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.5,
  },
  optionText: { fontSize: 18, color: "#2E7D32" },
  optionTextSelected: { color: "#fff", fontWeight: "700" },
  optionTextLocked: { color: "#9E9E9E" },
  lockIcon: { marginLeft: 10, fontSize: 16 },
  nextButton: { backgroundColor: "#2E7D32", paddingVertical: 16, paddingHorizontal: 50, borderRadius: 14 },
  nextButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});