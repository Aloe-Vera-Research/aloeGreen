import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function FarmSetupScreen() {
  const router = useRouter();

  const [farmName, setFarmName] = useState("");
  const [plantCount, setPlantCount] = useState("");
  const [soilType, setSoilType] = useState("Loamy");
  const [plantingDate, setPlantingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!farmName.trim()) {
      newErrors.farmName = "Farm name is required";
    }
    
    if (!plantCount.trim()) {
      newErrors.plantCount = "Plant count is required";
    } else if (Number(plantCount) <= 0) {
      newErrors.plantCount = "Plant count must be greater than 0";
    } else if (Number(plantCount) > 1000000) {
      newErrors.plantCount = "Plant count seems too high";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveFarmSetup = async () => {
    if (!validateForm()) {
      return;
    }

    const farmData = {
      farmName,
      plantCount: Number(plantCount),
      soilType,
      plantingDate: plantingDate.toISOString(),
    };

    try {
      await AsyncStorage.setItem("farmConfig", JSON.stringify(farmData));
      await AsyncStorage.setItem("farmConfigured", "true");
      router.replace("/yield");
    } catch (error) {
      alert("Error saving farm configuration. Please try again.");
    }
  };

  const soilOptions = [
    { 
      type: "Loamy", 
      icon: "leaf-outline",
      description: "Best for Aloe" 
    },
    { 
      type: "Sandy", 
      icon: "water-outline",
      description: "Good drainage" 
    },
    { 
      type: "Clay", 
      icon: "fitness-outline",
      description: "Compact soil" 
    },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#2E7D32", "#1B5E20"]}
              style={styles.iconGradient}
            >
              <Ionicons name="leaf" size={32} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Farm Setup</Text>
          <Text style={styles.subtitle}>
            Let's configure your Aloe Vera farm to get started
          </Text>
          
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressText}>Step 1 of 1</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Farm Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Farm Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={[
              styles.inputWrapper,
              focusedField === "farmName" && styles.inputWrapperFocused,
              errors.farmName && styles.inputWrapperError
            ]}>
              <Ionicons 
                name="home-outline" 
                size={20} 
                color={focusedField === "farmName" ? "#2E7D32" : "#9E9E9E"} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your farm name"
                placeholderTextColor="#BDBDBD"
                value={farmName}
                onChangeText={(text) => {
                  setFarmName(text);
                  if (errors.farmName) {
                    setErrors({...errors, farmName: null});
                  }
                }}
                onFocus={() => setFocusedField("farmName")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.farmName && (
              <Text style={styles.errorText}>{errors.farmName}</Text>
            )}
          </View>

          {/* Plant Count */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Number of Aloe Plants <Text style={styles.required}>*</Text>
            </Text>
            <View style={[
              styles.inputWrapper,
              focusedField === "plantCount" && styles.inputWrapperFocused,
              errors.plantCount && styles.inputWrapperError
            ]}>
              <Ionicons 
                name="leaf-outline" 
                size={20} 
                color={focusedField === "plantCount" ? "#2E7D32" : "#9E9E9E"} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g., 1200"
                placeholderTextColor="#BDBDBD"
                keyboardType="numeric"
                value={plantCount}
                onChangeText={(text) => {
                  setPlantCount(text);
                  if (errors.plantCount) {
                    setErrors({...errors, plantCount: null});
                  }
                }}
                onFocus={() => setFocusedField("plantCount")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.plantCount && (
              <Text style={styles.errorText}>{errors.plantCount}</Text>
            )}
          </View>

          {/* Soil Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Soil Type</Text>
            <Text style={styles.helper}>Select the type that best matches your farm</Text>
            <View style={styles.soilGrid}>
              {soilOptions.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.soilCard,
                    soilType === option.type && styles.soilCardActive,
                  ]}
                  onPress={() => setSoilType(option.type)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.soilIconContainer,
                    soilType === option.type && styles.soilIconContainerActive
                  ]}>
                    <Ionicons 
                      name={option.icon} 
                      size={24} 
                      color={soilType === option.type ? "#FFFFFF" : "#2E7D32"} 
                    />
                  </View>
                  <Text style={[
                    styles.soilTitle,
                    soilType === option.type && styles.soilTitleActive,
                  ]}>
                    {option.type}
                  </Text>
                  <Text style={[
                    styles.soilDescription,
                    soilType === option.type && styles.soilDescriptionActive,
                  ]}>
                    {option.description}
                  </Text>
                  {soilType === option.type && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Planting Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Planting Start Date</Text>
            <Text style={styles.helper}>When did you plant your Aloe Vera?</Text>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dateIconContainer}>
                <Ionicons name="calendar" size={22} color="#2E7D32" />
              </View>
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Selected Date</Text>
                <Text style={styles.dateText}>
                  {plantingDate.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
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
                maximumDate={new Date()}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveFarmSetup}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#2E7D32", "#1B5E20"]}
            style={styles.saveGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveText}>Continue to Dashboard</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
    lineHeight: 24,
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "100%",
    backgroundColor: "#2E7D32",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 8,
    fontWeight: "500",
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 4,
  },
  required: {
    color: "#F44336",
  },
  helper: {
    fontSize: 13,
    color: "#9E9E9E",
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  inputWrapperFocused: {
    borderColor: "#2E7D32",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: "#F44336",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#212121",
  },
  errorText: {
    fontSize: 13,
    color: "#F44336",
    marginTop: 6,
    marginLeft: 4,
  },
  soilGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  soilCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    position: "relative",
  },
  soilCardActive: {
    borderColor: "#2E7D32",
    backgroundColor: "#F1F8F4",
  },
  soilIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F8F4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  soilIconContainerActive: {
    backgroundColor: "#2E7D32",
  },
  soilTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 4,
  },
  soilTitleActive: {
    color: "#2E7D32",
  },
  soilDescription: {
    fontSize: 12,
    color: "#9E9E9E",
    textAlign: "center",
  },
  soilDescriptionActive: {
    color: "#2E7D32",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    marginTop: 8,
  },
  dateIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F8F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: "#9E9E9E",
    marginBottom: 2,
    fontWeight: "500",
  },
  dateText: {
    fontSize: 15,
    color: "#212121",
    fontWeight: "600",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  saveButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});