import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

const soilTypes = ["Sandy", "Loam", "Clay"];
const plantStages = ["Baby", "Mature", "Damage Recovery"];

export default function FertilizerScreen() {
    const router = useRouter();
  const [step, setStep] = useState(1);
  const [soil, setSoil] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);

  // Fake IoT & Soil data (replace with real API later)
  const iotData = {
    temperature: "29°C",
    moisture: "42%",
    nitrogen: "Medium",
    soilPH: "6.5",
    N: "Medium",
    P: "Low",
    K: "High",
  };

  const progressParts = 3;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        {[...Array(progressParts)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index < step ? styles.progressFill : styles.progressEmpty,
            ]}
          />
        ))}
      </View>

      {/* Content container */}
      <View style={styles.contentWrapper}>
        {/* STEP 1 */}
        {step === 1 && (
          <>
            <Text style={styles.title}>Select Soil Type</Text>
            {soilTypes.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.option, soil === item && styles.selected]}
                onPress={() => setSoil(item)}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <Text style={styles.title}>Select Plant Stage</Text>
            {plantStages.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.option, stage === item && styles.selected]}
                onPress={() => setStage(item)}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <Text style={styles.title}>IoT Sensor Data & Soil Info</Text>
            <View style={styles.iotCard}>
              <Text>🌡 Temperature: {iotData.temperature}</Text>
              <Text>💧 Moisture: {iotData.moisture}</Text>
              <Text>🧪 Nitrogen (IoT): {iotData.nitrogen}</Text>
              <Text>🌱 Soil pH: {iotData.soilPH}</Text>
              <Text>🧪 N: {iotData.N}</Text>
              <Text>🧪 P: {iotData.P}</Text>
              <Text>🧪 K: {iotData.K}</Text>
            </View>
          </>
        )}
      </View>

      {/* BUTTON */}
      <TouchableOpacity
  style={[
    styles.button,
    (step === 1 && !soil) || (step === 2 && !stage)
      ? styles.disabled
      : null,
  ]}
  disabled={(step === 1 && !soil) || (step === 2 && !stage)}
  onPress={() => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Navigate to Fertilizer Plan screen and pass selected soil/stage/iotData if needed
      router.push({
        pathname: "/fertilizer/plan",
        params: {
          soil,
          stage,
          temperature: iotData.temperature,
          moisture: iotData.moisture,
          nitrogen: iotData.nitrogen,
          soilPH: iotData.soilPH,
          N: iotData.N,
          P: iotData.P,
          K: iotData.K,
        },
      });
    }
  }}
>
  <Text style={styles.buttonText}>{step < 3 ? "Next" : "View Plan"}</Text>
</TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E8F5E9",
    marginTop:20
  },
  progressBar: {
    flexDirection: "row",
    height: 10,
    marginBottom: 30,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressSegment: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 5,
  },
  progressFill: {
    backgroundColor: "#2E7D32",
  },
  progressEmpty: {
    backgroundColor: "#C8E6C9",
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 20,
    textAlign: "center",
  },
  option: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  selected: {
    backgroundColor: "#C8E6C9",
    borderColor: "#2E7D32",
  },
  optionText: {
    fontSize: 16,
    color: "#1B5E20",
    textAlign: "center",
  },
  iotCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    gap: 10,
  },
  button: {
    marginTop: 30,
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom:40
  },
  disabled: {
    backgroundColor: "#9E9E9E",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
