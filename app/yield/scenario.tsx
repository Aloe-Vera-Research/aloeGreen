import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Animated 
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function ScenarioScreen() {
  // 🔧 Base values (from ML model – prototype)
  const basePerPlantYield = 220; // grams
  const plantCount = 500;

  // Scenario inputs
  const [irrigation, setIrrigation] = useState(4); // mm
  const [temperature, setTemperature] = useState(32); // °C
  const [fertilizer, setFertilizer] = useState(50); // %
  const [sunlight, setSunlight] = useState(8); // hours

  // Animation values
  const [yieldAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  // 🔧 Enhanced simulation logic
  const irrigationImpact = irrigation * 2.5; // +2.5g per mm
  const temperatureImpact = 
    temperature > 35 ? -15 : 
    temperature < 25 ? -8 : 
    temperature >= 28 && temperature <= 32 ? 5 : 0;
  const fertilizerImpact = (fertilizer / 100) * 15; // max +15g
  const sunlightImpact = 
    sunlight >= 6 && sunlight <= 8 ? 8 : 
    sunlight > 8 ? -5 : -10;

  const perPlantScenarioYield = Math.max(
    0,
    basePerPlantYield + irrigationImpact + temperatureImpact + 
    fertilizerImpact + sunlightImpact
  );

  const totalScenarioYieldKg = ((perPlantScenarioYield * plantCount) / 1000).toFixed(1);
  const baseYieldKg = ((basePerPlantYield * plantCount) / 1000).toFixed(1);
  const yieldChange = ((perPlantScenarioYield - basePerPlantYield) / basePerPlantYield * 100).toFixed(1);
  const isPositiveChange = parseFloat(yieldChange) >= 0;

  // Animate yield changes
  useEffect(() => {
    Animated.parallel([
      Animated.spring(yieldAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [perPlantScenarioYield]);

  // Reset to defaults
  const resetScenario = () => {
    setIrrigation(4);
    setTemperature(32);
    setFertilizer(50);
    setSunlight(8);
  };

  // Preset scenarios
  const applyPreset = (preset) => {
    switch(preset) {
      case 'optimal':
        setIrrigation(6);
        setTemperature(30);
        setFertilizer(75);
        setSunlight(7);
        break;
      case 'drought':
        setIrrigation(2);
        setTemperature(38);
        setFertilizer(40);
        setSunlight(10);
        break;
      case 'rainy':
        setIrrigation(8);
        setTemperature(26);
        setFertilizer(60);
        setSunlight(5);
        break;
    }
  };

  const getImpactColor = (value) => {
    if (value > 5) return '#2E7D32';
    if (value < -5) return '#D32F2F';
    return '#F57C00';
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Scenario Testing</Text>
            <Text style={styles.subtitle}>
              Predict yield impact of environmental changes
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetScenario}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* Preset Scenarios */}
        <View style={styles.presetContainer}>
          <Text style={styles.presetLabel}>Quick Scenarios:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetScroll}
          >
            <TouchableOpacity 
              style={styles.presetChip}
              onPress={() => applyPreset('optimal')}
              activeOpacity={0.7}
            >
              <Ionicons name="sunny" size={16} color="#2E7D32" />
              <Text style={styles.presetText}>Optimal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.presetChip}
              onPress={() => applyPreset('drought')}
              activeOpacity={0.7}
            >
              <Ionicons name="flame" size={16} color="#F57C00" />
              <Text style={styles.presetText}>Drought</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.presetChip}
              onPress={() => applyPreset('rainy')}
              activeOpacity={0.7}
            >
              <Ionicons name="rainy" size={16} color="#1976D2" />
              <Text style={styles.presetText}>Rainy Season</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Result Cards */}
      <View style={styles.resultsSection}>
        {/* Main Yield Card */}
        <Animated.View 
          style={[
            styles.mainResultCard,
            { 
              opacity: fadeAnim,
              transform: [{ scale: yieldAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={isPositiveChange ? ['#2E7D32', '#1B5E20'] : ['#F57C00', '#E65100']}
            style={styles.resultGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.resultHeader}>
              <View style={styles.resultIconContainer}>
                <Ionicons name="leaf" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.changeIndicator}>
                <Ionicons 
                  name={isPositiveChange ? "trending-up" : "trending-down"} 
                  size={16} 
                  color="#FFFFFF" 
                />
                <Text style={styles.changeText}>
                  {isPositiveChange ? '+' : ''}{yieldChange}%
                </Text>
              </View>
            </View>

            <Text style={styles.resultLabel}>Predicted Yield (Per Plant)</Text>
            <View style={styles.resultValueRow}>
              <Text style={styles.resultValue}>{perPlantScenarioYield}</Text>
              <Text style={styles.resultUnit}>grams</Text>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonText}>
                vs baseline: {basePerPlantYield}g
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Total Yield Card */}
        <View style={styles.totalYieldCard}>
          <View style={styles.totalHeader}>
            <Ionicons name="analytics-outline" size={20} color="#2E7D32" />
            <Text style={styles.totalLabel}>Total Farm Yield</Text>
          </View>
          <Text style={styles.totalValue}>{totalScenarioYieldKg} kg</Text>
          <Text style={styles.totalNote}>
            Based on {plantCount.toLocaleString()} Aloe plants
          </Text>
          
          {/* Yield Comparison Bar */}
          <View style={styles.comparisonBar}>
            <View style={styles.comparisonBarTrack}>
              <View 
                style={[
                  styles.comparisonBarFill,
                  { 
                    width: `${(parseFloat(totalScenarioYieldKg) / parseFloat(baseYieldKg)) * 50}%`,
                    backgroundColor: isPositiveChange ? '#2E7D32' : '#F57C00'
                  }
                ]} 
              />
            </View>
            <Text style={styles.comparisonBarLabel}>
              Baseline: {baseYieldKg} kg
            </Text>
          </View>
        </View>
      </View>

      {/* Control Sliders */}
      <View style={styles.controlsSection}>
        <Text style={styles.sectionTitle}>Adjust Parameters</Text>

        {/* Irrigation Control */}
        <View style={styles.controlCard}>
          <View style={styles.controlHeader}>
            <View style={styles.controlLeft}>
              <View style={[styles.controlIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="water" size={20} color="#1976D2" />
              </View>
              <View>
                <Text style={styles.controlTitle}>Irrigation</Text>
                <Text style={styles.controlSubtitle}>Daily water amount</Text>
              </View>
            </View>
            <View style={styles.controlValueContainer}>
              <Text style={styles.controlValue}>{irrigation}</Text>
              <Text style={styles.controlUnit}>mm</Text>
            </View>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={irrigation}
            onValueChange={setIrrigation}
            minimumTrackTintColor="#1976D2"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#1976D2"
            style={styles.slider}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0</Text>
            <Text style={styles.sliderLabel}>5</Text>
            <Text style={styles.sliderLabel}>10 mm</Text>
          </View>
          <View style={styles.impactBadge}>
            <Text style={[styles.impactText, { color: getImpactColor(irrigationImpact) }]}>
              Impact: {irrigationImpact > 0 ? '+' : ''}{irrigationImpact.toFixed(1)}g
            </Text>
          </View>
        </View>

        {/* Temperature Control */}
        <View style={styles.controlCard}>
          <View style={styles.controlHeader}>
            <View style={styles.controlLeft}>
              <View style={[styles.controlIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="thermometer" size={20} color="#F57C00" />
              </View>
              <View>
                <Text style={styles.controlTitle}>Temperature</Text>
                <Text style={styles.controlSubtitle}>Average daily temp</Text>
              </View>
            </View>
            <View style={styles.controlValueContainer}>
              <Text style={styles.controlValue}>{temperature}</Text>
              <Text style={styles.controlUnit}>°C</Text>
            </View>
          </View>
          <Slider
            minimumValue={20}
            maximumValue={45}
            step={1}
            value={temperature}
            onValueChange={setTemperature}
            minimumTrackTintColor="#F57C00"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#F57C00"
            style={styles.slider}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>20</Text>
            <Text style={styles.sliderLabel}>32</Text>
            <Text style={styles.sliderLabel}>45°C</Text>
          </View>
          <View style={styles.impactBadge}>
            <Text style={[styles.impactText, { color: getImpactColor(temperatureImpact) }]}>
              Impact: {temperatureImpact > 0 ? '+' : ''}{temperatureImpact.toFixed(1)}g
            </Text>
          </View>
        </View>

        {/* Fertilizer Control */}
        <View style={styles.controlCard}>
          <View style={styles.controlHeader}>
            <View style={styles.controlLeft}>
              <View style={[styles.controlIcon, { backgroundColor: '#F1F8F4' }]}>
                <Ionicons name="nutrition" size={20} color="#2E7D32" />
              </View>
              <View>
                <Text style={styles.controlTitle}>Fertilizer</Text>
                <Text style={styles.controlSubtitle}>Application level</Text>
              </View>
            </View>
            <View style={styles.controlValueContainer}>
              <Text style={styles.controlValue}>{fertilizer}</Text>
              <Text style={styles.controlUnit}>%</Text>
            </View>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={100}
            step={5}
            value={fertilizer}
            onValueChange={setFertilizer}
            minimumTrackTintColor="#2E7D32"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#2E7D32"
            style={styles.slider}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0</Text>
            <Text style={styles.sliderLabel}>50</Text>
            <Text style={styles.sliderLabel}>100%</Text>
          </View>
          <View style={styles.impactBadge}>
            <Text style={[styles.impactText, { color: getImpactColor(fertilizerImpact) }]}>
              Impact: {fertilizerImpact > 0 ? '+' : ''}{fertilizerImpact.toFixed(1)}g
            </Text>
          </View>
        </View>

        {/* Sunlight Control */}
        <View style={styles.controlCard}>
          <View style={styles.controlHeader}>
            <View style={styles.controlLeft}>
              <View style={[styles.controlIcon, { backgroundColor: '#FFF9C4' }]}>
                <Ionicons name="sunny" size={20} color="#F9A825" />
              </View>
              <View>
                <Text style={styles.controlTitle}>Sunlight</Text>
                <Text style={styles.controlSubtitle}>Daily exposure</Text>
              </View>
            </View>
            <View style={styles.controlValueContainer}>
              <Text style={styles.controlValue}>{sunlight}</Text>
              <Text style={styles.controlUnit}>hrs</Text>
            </View>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={12}
            step={1}
            value={sunlight}
            onValueChange={setSunlight}
            minimumTrackTintColor="#F9A825"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#F9A825"
            style={styles.slider}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0</Text>
            <Text style={styles.sliderLabel}>6</Text>
            <Text style={styles.sliderLabel}>12 hrs</Text>
          </View>
          <View style={styles.impactBadge}>
            <Text style={[styles.impactText, { color: getImpactColor(sunlightImpact) }]}>
              Impact: {sunlightImpact > 0 ? '+' : ''}{sunlightImpact.toFixed(1)}g
            </Text>
          </View>
        </View>
      </View>

      {/* Insights Card */}
      <View style={styles.insightsCard}>
        <View style={styles.insightsHeader}>
          <Ionicons name="bulb" size={20} color="#F9A825" />
          <Text style={styles.insightsTitle}>Optimization Insights</Text>
        </View>
        {isPositiveChange ? (
          <Text style={styles.insightsText}>
            Great! Your current parameters are predicted to increase yield by{' '}
            <Text style={styles.insightsBold}>{yieldChange}%</Text>. 
            {irrigation > 5 && " Consider maintaining higher irrigation levels."}
            {temperature >= 28 && temperature <= 32 && " Temperature is in optimal range."}
          </Text>
        ) : (
          <Text style={styles.insightsText}>
            Your current parameters may decrease yield by{' '}
            <Text style={styles.insightsBold}>{Math.abs(parseFloat(yieldChange))}%</Text>. 
            {temperature > 35 && " Try reducing heat stress with shade or cooling."}
            {irrigation < 3 && " Increase irrigation to improve yield."}
          </Text>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Ionicons name="information-circle" size={20} color="#1976D2" />
        </View>
        <Text style={styles.infoText}>
          Predictions are based on simplified simulation models. Production version 
          will use trained ML ensemble for more accurate forecasting.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#757575",
    lineHeight: 22,
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F8F4",
    justifyContent: "center",
    alignItems: "center",
  },
  presetContainer: {
    marginTop: 8,
  },
  presetLabel: {
    fontSize: 13,
    color: "#757575",
    marginBottom: 10,
    fontWeight: "500",
  },
  presetScroll: {
    gap: 8,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  presetText: {
    fontSize: 13,
    color: "#424242",
    fontWeight: "500",
  },
  resultsSection: {
    padding: 20,
    gap: 14,
  },
  mainResultCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  resultGradient: {
    padding: 24,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  changeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resultLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
    fontWeight: "500",
  },
  resultValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  resultValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -2,
  },
  resultUnit: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 8,
  },
  comparisonRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  comparisonText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  totalYieldCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  totalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 15,
    color: "#616161",
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 6,
    letterSpacing: -1,
  },
  totalNote: {
    fontSize: 13,
    color: "#9E9E9E",
    marginBottom: 16,
  },
  comparisonBar: {
    marginTop: 8,
  },
  comparisonBarTrack: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  comparisonBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  comparisonBarLabel: {
    fontSize: 12,
    color: "#757575",
  },
  controlsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 16,
  },
  controlCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  controlHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  controlLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  controlIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 2,
  },
  controlSubtitle: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  controlValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  controlValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
  },
  controlUnit: {
    fontSize: 13,
    color: "#757575",
    marginLeft: 4,
  },
  slider: {
    marginVertical: 8,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 11,
    color: "#9E9E9E",
  },
  impactBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  impactText: {
    fontSize: 12,
    fontWeight: "600",
  },
  insightsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#FFFBEA",
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#F9A825",
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  insightsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#212121",
  },
  insightsText: {
    fontSize: 14,
    color: "#616161",
    lineHeight: 20,
  },
  insightsBold: {
    fontWeight: "700",
    color: "#212121",
  },
  infoCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoIconContainer: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1565C0",
    lineHeight: 19,
  },
});