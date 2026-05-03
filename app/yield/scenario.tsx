import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "../../context/LanguageContext";
import { BASE_URL } from "../../config/api";

const API_BASE_URL = BASE_URL;
const { width } = Dimensions.get("window");

type YieldBaseInput = {
  humidity_pct: number;
  irrigation_mm: number;
  plant_age_months: number;
  rainfall_mm: number;
  soil_moisture_pct: number;
  soil_organic_matter_pct: number;
  soil_ph: number;
  soil_texture_enc: number;
  temp_day_c: number;
};

type FarmSetup = {
  plantCount: number;
  plantAgeMonths: number;
};

export default function ScenarioScreen() {
  const { t } = useLanguage();

  const requestIdRef = React.useRef(0);

  const [plantCount, setPlantCount] = useState<number>(0);
  const [baseInput, setBaseInput] = useState<YieldBaseInput | null>(null);

  const [basePerPlantYield, setBasePerPlantYield] = useState<number>(0);
  const [scenarioYield, setScenarioYield] = useState<number>(0);
  const [yieldChange, setYieldChange] = useState<string>("0.0");

  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);
  const [loadingScenario, setLoadingScenario] = useState<boolean>(false);

  const [irrigation, setIrrigation] = useState<number>(4);
  const [temperature, setTemperature] = useState<number>(32);

  const [fertilizer, setFertilizer] = useState<number>(50);
  const [sunlight, setSunlight] = useState<number>(8);

  const [yieldAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  const perPlantScenarioYield = scenarioYield || basePerPlantYield;

  const totalScenarioYieldKg = (
    (perPlantScenarioYield * plantCount) /
    1000
  ).toFixed(2);

  const baseYieldKg = ((basePerPlantYield * plantCount) / 1000).toFixed(2);

  const isPositiveChange = parseFloat(yieldChange) >= 0;

  /**
   * These are only fallback values.
   * They are used only if AsyncStorage or backend live environment data is missing.
   */
  const FALLBACK_BASE: YieldBaseInput = {
    humidity_pct: 70,
    irrigation_mm: 4,
    plant_age_months: 2,
    rainfall_mm: 1.2,
    soil_moisture_pct: 38,
    soil_organic_matter_pct: 2.8,
    soil_ph: 6.5,
    soil_texture_enc: 1,
    temp_day_c: 32.5,
  };

  useEffect(() => {
    initializeDynamicBase();

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
  }, []);

  useEffect(() => {
    if (!baseInput) return;

    const timer = setTimeout(() => {
      fetchScenarioPrediction();
    }, 600);

    return () => clearTimeout(timer);
  }, [irrigation, temperature, baseInput]);

  const loadFarmSetup = async (): Promise<FarmSetup> => {
    try {
      const data = await AsyncStorage.getItem("farmConfig");

      if (!data) {
        return {
          plantCount: 0,
          plantAgeMonths: FALLBACK_BASE.plant_age_months,
        };
      }

      const parsed = JSON.parse(data);

      const loadedPlantCount = Number(parsed.plantCount || 0);

      /**
       * This supports multiple possible names from your farm setup screen.
       * Use the one that matches your saved AsyncStorage object.
       */
      const loadedPlantAge = Number(
        parsed.plantAgeMonths ||
          parsed.plantAge ||
          parsed.ageMonths ||
          FALLBACK_BASE.plant_age_months
      );

      setPlantCount(loadedPlantCount);

      return {
        plantCount: loadedPlantCount,
        plantAgeMonths: loadedPlantAge,
      };
    } catch (error) {
      console.log("Error loading farm config:", error);

      return {
        plantCount: 0,
        plantAgeMonths: FALLBACK_BASE.plant_age_months,
      };
    }
  };

  const fetchLatestEnvironment = async () => {
    try {
      /**
       * Change this endpoint if your backend route is different.
       * Example alternatives:
       * /environment/latest
       * /api/environment/latest
       * /iot/latest
       * /sensor/latest
       */
      const response = await fetch(`${API_BASE_URL}/environment/latest`);

      if (!response.ok) {
        throw new Error(`Environment API error: ${response.status}`);
      }

      const data = await response.json();

      /**
       * These mappings support common MongoDB / IoT field names.
       * Adjust field names if your database uses different names.
       */
      return {
        humidity_pct: Number(
          data.humidity_pct ??
            data.humidity ??
            data.humidityPct ??
            FALLBACK_BASE.humidity_pct
        ),

        irrigation_mm: Number(
          data.irrigation_mm ??
            data.irrigation ??
            data.irrigationMm ??
            FALLBACK_BASE.irrigation_mm
        ),

        rainfall_mm: Number(
          data.rainfall_mm ??
            data.rainfall ??
            data.rainfallMm ??
            FALLBACK_BASE.rainfall_mm
        ),

        soil_moisture_pct: Number(
          data.soil_moisture_pct ??
            data.soil_moisture ??
            data.soilMoisture ??
            data.moisture ??
            FALLBACK_BASE.soil_moisture_pct
        ),

        soil_organic_matter_pct: Number(
          data.soil_organic_matter_pct ??
            data.soil_organic_matter ??
            data.soilOrganicMatter ??
            FALLBACK_BASE.soil_organic_matter_pct
        ),

        soil_ph: Number(
          data.soil_ph ??
            data.soil_pH ??
            data.ph ??
            data.pH ??
            FALLBACK_BASE.soil_ph
        ),

        soil_texture_enc: Number(
          data.soil_texture_enc ??
            data.soilTextureEnc ??
            data.soil_texture ??
            FALLBACK_BASE.soil_texture_enc
        ),

        temp_day_c: Number(
          data.temp_day_c ??
            data.temperature ??
            data.temp ??
            data.tempDayC ??
            FALLBACK_BASE.temp_day_c
        ),
      };
    } catch (error) {
      console.log("Latest environment fetch error:", error);

      return {
        humidity_pct: FALLBACK_BASE.humidity_pct,
        irrigation_mm: irrigation,
        rainfall_mm: FALLBACK_BASE.rainfall_mm,
        soil_moisture_pct: FALLBACK_BASE.soil_moisture_pct,
        soil_organic_matter_pct: FALLBACK_BASE.soil_organic_matter_pct,
        soil_ph: FALLBACK_BASE.soil_ph,
        soil_texture_enc: FALLBACK_BASE.soil_texture_enc,
        temp_day_c: temperature,
      };
    }
  };

  const initializeDynamicBase = async () => {
    try {
      setLoadingInitial(true);

      const farm = await loadFarmSetup();
      const environment = await fetchLatestEnvironment();

      const dynamicBase: YieldBaseInput = {
        humidity_pct: environment.humidity_pct,
        irrigation_mm: environment.irrigation_mm,
        plant_age_months: farm.plantAgeMonths,
        rainfall_mm: environment.rainfall_mm,
        soil_moisture_pct: environment.soil_moisture_pct,
        soil_organic_matter_pct: environment.soil_organic_matter_pct,
        soil_ph: environment.soil_ph,
        soil_texture_enc: environment.soil_texture_enc,
        temp_day_c: environment.temp_day_c,
      };

      setBaseInput(dynamicBase);

      /**
       * Initialize sliders using live environment data.
       */
      setIrrigation(Math.round(dynamicBase.irrigation_mm));
      setTemperature(Math.round(dynamicBase.temp_day_c));

      await fetchBasePrediction(dynamicBase);
    } catch (error) {
      console.log("Dynamic base initialization error:", error);
    } finally {
      setLoadingInitial(false);
    }
  };

  const fetchBasePrediction = async (base: YieldBaseInput) => {
    try {
      const payload = {
        ...base,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/yield/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Base prediction HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data?.success) {
        setBasePerPlantYield(Number(data.gel_weight_g ?? 0));
      }
    } catch (error) {
      console.log("Base prediction error:", error);
    }
  };

  const fetchScenarioPrediction = async () => {
    try {
      if (!baseInput) return;

      const requestId = ++requestIdRef.current;
      setLoadingScenario(true);

      const payload = {
        base: baseInput,
        scenarios: [
          {
            name: "Current Scenario",
            changes: {
              irrigation_mm: irrigation,
              temp_day_c: temperature,

              /**
               * Do not add fertilizer or sunlight here unless your backend model
               * was trained with those fields.
               */
            },
          },
        ],
      };

      const response = await fetch(`${API_BASE_URL}/yield/scenario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      const data = rawText ? JSON.parse(rawText) : null;

      if (requestId !== requestIdRef.current) return;

      if (data?.success && data.results?.length > 0) {
        const currentScenario =
          data.results.find((item: any) => item.name === "Current Scenario") ||
          data.results[data.results.length - 1];

        setScenarioYield(Number(currentScenario.gel_weight_g ?? 0));
        setYieldChange(String(currentScenario.percent_change ?? 0));
      }
    } catch (error) {
      console.log("Scenario prediction error:", error);
    } finally {
      setLoadingScenario(false);
    }
  };

  const resetScenario = () => {
    if (baseInput) {
      setIrrigation(Math.round(baseInput.irrigation_mm));
      setTemperature(Math.round(baseInput.temp_day_c));
    } else {
      setIrrigation(4);
      setTemperature(32);
    }

    setFertilizer(50);
    setSunlight(8);
  };

  const refreshLiveData = async () => {
    await initializeDynamicBase();
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case "optimal":
        setIrrigation(6);
        setTemperature(30);
        setFertilizer(75);
        setSunlight(7);
        break;

      case "drought":
        setIrrigation(2);
        setTemperature(38);
        setFertilizer(40);
        setSunlight(10);
        break;

      case "rainy":
        setIrrigation(8);
        setTemperature(26);
        setFertilizer(60);
        setSunlight(5);
        break;

      default:
        break;
    }
  };

  const comparisonFillWidth = () => {
    const base = parseFloat(baseYieldKg);
    const scenario = parseFloat(totalScenarioYieldKg);

    if (!base || base <= 0) return "50%";

    const percentage = (scenario / base) * 50;
    const clamped = Math.max(5, Math.min(100, percentage));

    return `${clamped}%`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.title}>{t("scenarioTesting")}</Text>
            <Text style={styles.subtitle}>
              {t("predictYieldImpactEnvironmentalChanges")}
            </Text>
          </View>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={refreshLiveData}
              activeOpacity={0.7}
            >
              {loadingInitial ? (
                <ActivityIndicator size="small" color="#2E7D32" />
              ) : (
                <Ionicons name="sync" size={20} color="#2E7D32" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetScenario}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color="#2E7D32" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.liveDataCard}>
          <View style={styles.liveDataHeader}>
            <Ionicons name="radio" size={16} color="#2E7D32" />
            <Text style={styles.liveDataTitle}>Dynamic Base Data</Text>
          </View>

          {baseInput ? (
            <Text style={styles.liveDataText}>
              Temp: {baseInput.temp_day_c.toFixed(1)}°C | Humidity:{" "}
              {baseInput.humidity_pct.toFixed(1)}% | Soil Moisture:{" "}
              {baseInput.soil_moisture_pct.toFixed(1)}% | pH:{" "}
              {baseInput.soil_ph.toFixed(1)}
            </Text>
          ) : (
            <Text style={styles.liveDataText}>Loading environment data...</Text>
          )}
        </View>

        <View style={styles.presetContainer}>
          <Text style={styles.presetLabel}>{t("quickScenarios")}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetScroll}
          >
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => applyPreset("optimal")}
              activeOpacity={0.7}
            >
              <Ionicons name="sunny" size={16} color="#2E7D32" />
              <Text style={styles.presetText}>{t("optimalScenario")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => applyPreset("drought")}
              activeOpacity={0.7}
            >
              <Ionicons name="flame" size={16} color="#F57C00" />
              <Text style={styles.presetText}>{t("droughtScenario")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => applyPreset("rainy")}
              activeOpacity={0.7}
            >
              <Ionicons name="rainy" size={16} color="#1976D2" />
              <Text style={styles.presetText}>{t("rainySeason")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <View style={styles.resultsSection}>
        <Animated.View
          style={[
            styles.mainResultCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: yieldAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={
              isPositiveChange ? ["#2E7D32", "#1B5E20"] : ["#F57C00", "#E65100"]
            }
            style={styles.resultGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.resultHeader}>
              <View style={styles.resultIconContainer}>
                <Ionicons name="leaf" size={28} color="#FFFFFF" />
              </View>

              <View style={styles.changeIndicator}>
                {loadingScenario ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name={isPositiveChange ? "trending-up" : "trending-down"}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.changeText}>
                      {isPositiveChange ? "+" : ""}
                      {yieldChange}%
                    </Text>
                  </>
                )}
              </View>
            </View>

            <Text style={styles.resultLabel}>{t("predictedYieldPerPlant")}</Text>

            <View style={styles.resultValueRow}>
              <Text style={styles.resultValue}>
                {loadingScenario
                  ? "..."
                  : Number(perPlantScenarioYield || 0).toFixed(2)}
              </Text>
              <Text style={styles.resultUnit}>{t("grams")}</Text>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonText}>
                {t("vsBaseline")} {Number(basePerPlantYield || 0).toFixed(2)}g
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.totalYieldCard}>
          <View style={styles.totalHeader}>
            <Ionicons name="analytics-outline" size={20} color="#2E7D32" />
            <Text style={styles.totalLabel}>{t("totalFarmYield")}</Text>
          </View>

          <Text style={styles.totalValue}>{totalScenarioYieldKg} kg</Text>

          <Text style={styles.totalNote}>
            {t("basedOnAloePlants")} {plantCount.toLocaleString()}{" "}
            {t("aloePlants")}
          </Text>

          <View style={styles.comparisonBar}>
            <View style={styles.comparisonBarTrack}>
              <View
                style={[
                  styles.comparisonBarFill,
                  {
                    width: comparisonFillWidth(),
                    backgroundColor: isPositiveChange ? "#2E7D32" : "#F57C00",
                  },
                ]}
              />
            </View>

            <Text style={styles.comparisonBarLabel}>
              {t("baseline")}: {baseYieldKg} kg
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.controlsSection}>
        <Text style={styles.sectionTitle}>{t("adjustParameters")}</Text>

        <View style={styles.controlCard}>
          <View style={styles.controlHeader}>
            <View style={styles.controlLeft}>
              <View
                style={[styles.controlIcon, { backgroundColor: "#E3F2FD" }]}
              >
                <Ionicons name="water" size={20} color="#1976D2" />
              </View>

              <View>
                <Text style={styles.controlTitle}>{t("irrigation")}</Text>
                <Text style={styles.controlSubtitle}>
                  {t("dailyWaterAmount")}
                </Text>
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
            <Text style={styles.impactText}>Used by prediction model</Text>
          </View>
        </View>

        <View style={styles.controlCard}>
          <View style={styles.controlHeader}>
            <View style={styles.controlLeft}>
              <View
                style={[styles.controlIcon, { backgroundColor: "#FFF3E0" }]}
              >
                <Ionicons name="thermometer" size={20} color="#F57C00" />
              </View>

              <View>
                <Text style={styles.controlTitle}>{t("temperature")}</Text>
                <Text style={styles.controlSubtitle}>
                  {t("averageDailyTemp")}
                </Text>
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
            <Text style={styles.impactText}>Used by prediction model</Text>
          </View>
        </View>
      </View>

      <View style={styles.insightsCard}>
        <View style={styles.insightsHeader}>
          <Ionicons name="bulb" size={20} color="#F9A825" />
          <Text style={styles.insightsTitle}>{t("optimizationInsights")}</Text>
        </View>

        {isPositiveChange ? (
          <Text style={styles.insightsText}>
            {t("greatCurrentParametersIncreaseYield")}{" "}
            <Text style={styles.insightsBold}>{yieldChange}%</Text>.
            {irrigation > 5 ? ` ${t("maintainHigherIrrigation")}` : ""}
            {temperature >= 28 && temperature <= 32
              ? ` ${t("temperatureOptimalRange")}`
              : ""}
          </Text>
        ) : (
          <Text style={styles.insightsText}>
            {t("currentParametersMayDecreaseYield")}{" "}
            <Text style={styles.insightsBold}>
              {Math.abs(parseFloat(yieldChange || "0"))}%
            </Text>
            .
            {temperature > 35 ? ` ${t("reduceHeatStress")}` : ""}
            {irrigation < 3 ? ` ${t("increaseIrrigationImproveYield")}` : ""}
          </Text>
        )}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Ionicons name="information-circle" size={20} color="#1976D2" />
        </View>

        <Text style={styles.infoText}>
          This scenario uses dynamic farm and environmental data as the baseline.
          Irrigation and temperature changes are sent to the yield model to
          calculate the predicted impact.
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
  headerTitleWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
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
  liveDataCard: {
    backgroundColor: "#F1F8F4",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D8ECDD",
  },
  liveDataHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  liveDataTitle: {
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "700",
  },
  liveDataText: {
    fontSize: 12,
    color: "#4E6E50",
    lineHeight: 18,
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
    minHeight: 30,
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
    backgroundColor: "#F1F8F4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  impactText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
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