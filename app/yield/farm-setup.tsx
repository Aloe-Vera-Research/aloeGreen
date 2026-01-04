import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function FarmSetupScreen() {
  const router = useRouter();

  const [farmName, setFarmName] = useState("");
  const [plantCount, setPlantCount] = useState("");
  const [soilType, setSoilType] = useState("Loamy");
  const [plantingDate, setPlantingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const saveFarmSetup = async () => {
    if (!farmName || !plantCount) {
      alert("Please fill all required fields");
      return;
    }

    const farmData = {
      farmName,
      plantCount: Number(plantCount),
      soilType,
      plantingDate: plantingDate.toISOString(),
    };

    await AsyncStorage.setItem("farmConfig", JSON.stringify(farmData));
    await AsyncStorage.setItem("farmConfigured", "true");

    router.replace("/yield");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Farm Setup</Text>
      <Text style={styles.subtitle}>
        Configure your Aloe Vera farm (one time only)
      </Text>

      {/* Farm Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Farm Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. AloeGreen Farm"
          value={farmName}
          onChangeText={setFarmName}
        />
      </View>

      {/* Plant Count */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Number of Aloe Plants</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1200"
          keyboardType="numeric"
          value={plantCount}
          onChangeText={setPlantCount}
        />
      </View>

      {/* Soil Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Soil Type</Text>
        <View style={styles.soilRow}>
          {["Loamy", "Sandy", "Clay"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.soilChip,
                soilType === type && styles.soilChipActive,
              ]}
              onPress={() => setSoilType(type)}
            >
              <Text
                style={[
                  styles.soilText,
                  soilType === type && styles.soilTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Planting Date */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Planting Start Date</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#1B5E20" />
          <Text style={styles.dateText}>
            {plantingDate.toDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={plantingDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setPlantingDate(date);
            }}
          />
        )}
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveFarmSetup}>
        <Text style={styles.saveText}>Save & Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#616161",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#424242",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  soilRow: {
    flexDirection: "row",
    gap: 10,
  },
  soilChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  soilChipActive: {
    backgroundColor: "#2E7D32",
  },
  soilText: {
    fontSize: 14,
    color: "#424242",
  },
  soilTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateText: {
    fontSize: 15,
    color: "#424242",
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: "#1B5E20",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
