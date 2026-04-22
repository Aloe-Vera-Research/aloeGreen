import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "../context/LanguageContext";
import { Language } from "../localization";

export default function LanguageScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { label: "English", value: "en" as Language },
    { label: "සිංහල", value: "si" as Language },
  ];

  const handleNext = async () => {
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("selectLanguage")}</Text>

      <View style={styles.options}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.value}
            style={[
              styles.option,
              language === lang.value && styles.optionSelected,
            ]}
            onPress={() => setLanguage(lang.value)}
          >
            <Text
              style={[
                styles.optionText,
                language === lang.value && styles.optionTextSelected,
              ]}
            >
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>{t("next")}</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#1B5E20",
    textAlign: "center",
  },
  options: {
    width: "100%",
    gap: 15,
    marginBottom: 40,
  },
  option: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
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
  optionText: {
    fontSize: 18,
    color: "#2E7D32",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  nextButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 14,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});