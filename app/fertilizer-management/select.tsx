import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const soilTypes = [
  { id: "Sandy", icon: "water-outline", description: "Fast draining, low nutrients" },
  { id: "Loam", icon: "leaf-outline", description: "Balanced, ideal for most plants" },
  { id: "Clay", icon: "layers-outline", description: "Nutrient-rich, slower drainage" },
];

const plantStages = [
  { id: "Baby", icon: "flower-outline", description: "Early growth phase" },
  { id: "Mature", icon: "nutrition-outline", description: "Full development stage" },
  { id: "Damage Recovery", icon: "medkit-outline", description: "Healing and repair" },
];

export default function FertilizerScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [soil, setSoil] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Fake IoT & Soil data
  const iotData = {
    temperature: "29°C",
    moisture: "42%",
    nitrogen: "Medium",
    soilPH: "6.5",
    N: "Medium",
    P: "Low",
    K: "High",
  };

  useEffect(() => {
    // Reset animations when step changes
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.95);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  const progressParts = 3;
  const progressWidth = (step / progressParts) * 100;

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3].map((stepNum) => (
        <View key={stepNum} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              step >= stepNum && styles.stepCircleActive,
              step === stepNum && styles.stepCircleCurrent,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                step >= stepNum && styles.stepNumberActive,
              ]}
            >
              {stepNum}
            </Text>
          </View>
          <Text style={styles.stepLabel}>
            {stepNum === 1 ? "Soil" : stepNum === 2 ? "Stage" : "Review"}
          </Text>
          {stepNum < 3 && (
            <View
              style={[
                styles.stepConnector,
                step > stepNum && styles.stepConnectorActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  return (
    <LinearGradient
      colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBackButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1B5E20" />
          </TouchableOpacity>
          <View style={styles.headerIconWrapper}>
            <Ionicons name="flask" size={32} color="#2E7D32" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Fertilizer Plan</Text>
            <Text style={styles.headerSubtitle}>Optimize your crop nutrition</Text>
          </View>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* STEP 1 - Soil Type */}
          {step === 1 && (
            <>
              <View style={styles.cardHeader}>
                <Ionicons name="earth" size={28} color="#2E7D32" />
                <Text style={styles.cardTitle}>Select Soil Type</Text>
              </View>
              <Text style={styles.cardDescription}>
                Choose the soil type that best matches your farm
              </Text>

              <View style={styles.optionsContainer}>
                {soilTypes.map((item, index) => (
                  <Animated.View
                    key={item.id}
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateX: slideAnim.interpolate({
                            inputRange: [0, 30],
                            outputRange: [0, 30 + index * 10],
                          }),
                        },
                      ],
                    }}
                  >
                    <TouchableOpacity
                      style={[styles.option, soil === item.id && styles.optionSelected]}
                      onPress={() => setSoil(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionIconWrapper}>
                        <Ionicons
                          name={item.icon as any}
                          size={32}
                          color={soil === item.id ? "#2E7D32" : "#4E6E4E"}
                        />
                      </View>
                      <View style={styles.optionContent}>
                        <Text
                          style={[
                            styles.optionTitle,
                            soil === item.id && styles.optionTitleSelected,
                          ]}
                        >
                          {item.id}
                        </Text>
                        <Text style={styles.optionDescription}>
                          {item.description}
                        </Text>
                      </View>
                      {soil === item.id && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </>
          )}

          {/* STEP 2 - Plant Stage */}
          {step === 2 && (
            <>
              <View style={styles.cardHeader}>
                <Ionicons name="analytics" size={28} color="#2E7D32" />
                <Text style={styles.cardTitle}>Select Plant Stage</Text>
              </View>
              <Text style={styles.cardDescription}>
                What stage are your Aloe Vera plants in?
              </Text>

              <View style={styles.optionsContainer}>
                {plantStages.map((item, index) => (
                  <Animated.View
                    key={item.id}
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateX: slideAnim.interpolate({
                            inputRange: [0, 30],
                            outputRange: [0, 30 + index * 10],
                          }),
                        },
                      ],
                    }}
                  >
                    <TouchableOpacity
                      style={[styles.option, stage === item.id && styles.optionSelected]}
                      onPress={() => setStage(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionIconWrapper}>
                        <Ionicons
                          name={item.icon as any}
                          size={32}
                          color={stage === item.id ? "#2E7D32" : "#4E6E4E"}
                        />
                      </View>
                      <View style={styles.optionContent}>
                        <Text
                          style={[
                            styles.optionTitle,
                            stage === item.id && styles.optionTitleSelected,
                          ]}
                        >
                          {item.id}
                        </Text>
                        <Text style={styles.optionDescription}>
                          {item.description}
                        </Text>
                      </View>
                      {stage === item.id && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </>
          )}

          {/* STEP 3 - IoT Data Review */}
          {step === 3 && (
            <>
              <View style={styles.cardHeader}>
                <Ionicons name="hardware-chip" size={28} color="#2E7D32" />
                <Text style={styles.cardTitle}>Environmental Data</Text>
              </View>
              <Text style={styles.cardDescription}>
                Review sensor readings and soil analysis
              </Text>

              <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Soil Type</Text>
                  <Text style={styles.summaryValue}>{soil}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Plant Stage</Text>
                  <Text style={styles.summaryValue}>{stage}</Text>
                </View>
              </View>

              <View style={styles.iotDataContainer}>
                <Text style={styles.sectionTitle}>IoT Sensor Readings</Text>
                <View style={styles.dataGrid}>
                  {[
                    { icon: "thermometer", label: "Temperature", value: iotData.temperature },
                    { icon: "water", label: "Moisture", value: iotData.moisture },
                    { icon: "flask", label: "Nitrogen", value: iotData.nitrogen },
                    { icon: "beaker", label: "Soil pH", value: iotData.soilPH },
                  ].map((item, index) => (
                    <View key={index} style={styles.dataCard}>
                      <View style={styles.dataIconWrapper}>
                        <Ionicons name={item.icon as any} size={24} color="#2E7D32" />
                      </View>
                      <Text style={styles.dataLabel}>{item.label}</Text>
                      <Text style={styles.dataValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>NPK Levels</Text>
                <View style={styles.npkContainer}>
                  {[
                    { label: "Nitrogen (N)", value: iotData.N, color: "#4CAF50" },
                    { label: "Phosphorus (P)", value: iotData.P, color: "#FF9800" },
                    { label: "Potassium (K)", value: iotData.K, color: "#2196F3" },
                  ].map((item, index) => (
                    <View key={index} style={styles.npkItem}>
                      <View style={styles.npkHeader}>
                        <Text style={styles.npkLabel}>{item.label}</Text>
                        <View
                          style={[
                            styles.npkBadge,
                            {
                              backgroundColor:
                                item.value === "High"
                                  ? "#4CAF50"
                                  : item.value === "Medium"
                                  ? "#FF9800"
                                  : "#F44336",
                            },
                          ]}
                        >
                          <Text style={styles.npkValue}>{item.value}</Text>
                        </View>
                      </View>
                      <View style={styles.npkBar}>
                        <View
                          style={[
                            styles.npkBarFill,
                            {
                              width:
                                item.value === "High"
                                  ? "80%"
                                  : item.value === "Medium"
                                  ? "50%"
                                  : "25%",
                              backgroundColor: item.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </Animated.View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {step > 1 ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#2E7D32" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="home" size={20} color="#2E7D32" />
              <Text style={styles.homeButtonText}>Home</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              (step === 1 && !soil) || (step === 2 && !stage)
                ? styles.buttonDisabled
                : null,
            ]}
            disabled={(step === 1 && !soil) || (step === 2 && !stage)}
            onPress={() => {
              if (step < 3) {
                setStep(step + 1);
              } else {
                router.push({
                  pathname: "/fertilizer-management/plan",
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
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                (step === 1 && !soil) || (step === 2 && !stage)
                  ? ["#9E9E9E", "#757575"]
                  : ["#2E7D32", "#1B5E20"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {step < 3 ? "Continue" : "View Plan"}
              </Text>
              <Ionicons
                name={step < 3 ? "arrow-forward" : "document-text"}
                size={20}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1B5E20",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#C8E6C9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  stepCircleActive: {
    borderColor: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },
  stepCircleCurrent: {
    backgroundColor: "#2E7D32",
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9E9E9E",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontSize: 12,
    color: "#4E6E4E",
    fontWeight: "600",
  },
  stepConnector: {
    position: "absolute",
    top: 20,
    left: "60%",
    right: "-60%",
    height: 2,
    backgroundColor: "#C8E6C9",
    zIndex: -1,
  },
  stepConnectorActive: {
    backgroundColor: "#2E7D32",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1B5E20",
  },
  cardDescription: {
    fontSize: 14,
    color: "#4E6E4E",
    marginBottom: 20,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#2E7D32",
  },
  optionIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: "#2E7D32",
  },
  optionDescription: {
    fontSize: 13,
    color: "#4E6E4E",
  },
  checkmark: {
    marginLeft: 8,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: "#F1F8F4",
    borderRadius: 12,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#4E6E4E",
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
  },
  iotDataContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 12,
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  dataCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  dataIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 12,
    color: "#4E6E4E",
    fontWeight: "600",
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E7D32",
  },
  npkContainer: {
    gap: 14,
  },
  npkItem: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 14,
  },
  npkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  npkLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B5E20",
  },
  npkBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  npkValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  npkBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  npkBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "700",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  homeButtonText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "700",
  },
  nextButton: {
    flex: 2,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    shadowOpacity: 0.1,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});