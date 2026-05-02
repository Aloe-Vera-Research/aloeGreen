import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "../context/LanguageContext";
import { Language } from "../localization";
import { Ionicons } from "@expo/vector-icons";

export default function LanguageScreen() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  const languages = [
    { label: "English", subtitle: "English language", value: "en" as Language, flag: "🇬🇧" },
    { label: "සිංහල", subtitle: "Sinhala language", value: "si" as Language, flag: "🇱🇰" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="globe-outline" size={32} color="#fff" />
        </View>
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.subtitle}>භාෂාව තෝරන්න</Text>
      </View>

      {/* Options */}
      <View style={styles.body}>
        {languages.map((lang) => {
          const isSelected = language === lang.value;
          return (
            <TouchableOpacity
              key={lang.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setLanguage(lang.value)}
              activeOpacity={0.85}
            >
              <View style={[styles.flagWrap, isSelected && styles.flagWrapSelected]}>
                <Text style={styles.flag}>{lang.flag}</Text>
              </View>
              <View style={styles.labelWrap}>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {lang.label}
                </Text>
                <Text style={styles.optionSub}>{lang.subtitle}</Text>
              </View>
              <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={isSelected ? "#fff" : "#A5D6A7"}
                />
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.hint}>You can change this later in settings</Text>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.replace("/(tabs)/home")}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F8E9" },
  header: {
    backgroundColor: "#2E7D32",
    paddingTop: 80,
    paddingBottom: 36,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  iconWrap: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  title: { fontSize: 20, fontWeight: "600", color: "#fff", letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 4 },
  body: { flex: 1, padding: 24 },
  option: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: "#fff", borderRadius: 18,
    borderWidth: 1, borderColor: "#E0E0E0",
    padding: 18, marginBottom: 14,
  },
  optionSelected: {
    borderColor: "#2E7D32", borderWidth: 2, backgroundColor: "#F1F8F1",
  },
  flagWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "#E8F5E9",
    alignItems: "center", justifyContent: "center",
  },
  flagWrapSelected: { backgroundColor: "#2E7D32" },
  flag: { fontSize: 22 },
  labelWrap: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: "500", color: "#212121" },
  optionLabelSelected: { color: "#1B5E20" },
  optionSub: { fontSize: 12, color: "#9E9E9E", marginTop: 2 },
  checkCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#E8F5E9",
    alignItems: "center", justifyContent: "center",
  },
  checkCircleSelected: { backgroundColor: "#2E7D32" },
  hint: { textAlign: "center", fontSize: 12, color: "#9E9E9E", marginBottom: 20 },
  nextButton: {
    backgroundColor: "#2E7D32", borderRadius: 16,
    paddingVertical: 16, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  nextButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});