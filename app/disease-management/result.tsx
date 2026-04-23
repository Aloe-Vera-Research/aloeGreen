import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useLanguage } from "../../context/LanguageContext";

export default function ResultScreen() {
  const router = useRouter();
  const { disease, confidence } = useLocalSearchParams();
  const { t } = useLanguage();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const diseaseData = {
    [t("aloeRust")]: {
      category: t("diseaseCategory"),
      severity: t("high"),
      description: t("aloeRustDescription"),
      causes: [
        t("aloeRustCause1"),
        t("aloeRustCause2"),
        t("aloeRustCause3"),
        t("aloeRustCause4"),
        t("aloeRustCause5"),
      ],
      treatment: [
        t("aloeRustTreatment1"),
        t("aloeRustTreatment2"),
        t("aloeRustTreatment3"),
        t("aloeRustTreatment4"),
        t("aloeRustTreatment5"),
      ],
      prevention: [
        t("aloeRustPrevention1"),
        t("aloeRustPrevention2"),
        t("aloeRustPrevention3"),
        t("aloeRustPrevention4"),
        t("aloeRustPrevention5"),
        t("aloeRustPrevention6"),
      ],
      spreadRisk: t("high"),
    },
    [t("anthracnose")]: {
      category: t("diseaseCategory"),
      severity: t("high"),
      description: t("anthracnoseDescription"),
      causes: [
        t("anthracnoseCause1"),
        t("anthracnoseCause2"),
        t("anthracnoseCause3"),
        t("anthracnoseCause4"),
        t("anthracnoseCause5"),
      ],
      treatment: [
        t("anthracnoseTreatment1"),
        t("anthracnoseTreatment2"),
        t("anthracnoseTreatment3"),
        t("anthracnoseTreatment4"),
        t("anthracnoseTreatment5"),
      ],
      prevention: [
        t("anthracnosePrevention1"),
        t("anthracnosePrevention2"),
        t("anthracnosePrevention3"),
        t("anthracnosePrevention4"),
        t("anthracnosePrevention5"),
        t("anthracnosePrevention6"),
      ],
      spreadRisk: t("high"),
    },
    [t("healthy")]: {
      category: t("healthyCategory"),
      severity: t("healthySeverity"),
      description: t("healthyDescription"),
      causes: [],
      treatment: [
        t("healthyTreatment1"),
        t("healthyTreatment2"),
        t("healthyTreatment3"),
        t("healthyTreatment4"),
        t("healthyTreatment5"),
      ],
      prevention: [
        t("healthyPrevention1"),
        t("healthyPrevention2"),
        t("healthyPrevention3"),
        t("healthyPrevention4"),
        t("healthyPrevention5"),
        t("healthyPrevention6"),
      ],
      spreadRisk: t("none"),
    },
    [t("leafSpot")]: {
      category: t("diseaseCategory"),
      severity: t("medium"),
      description: t("leafSpotDescription"),
      causes: [
        t("leafSpotCause1"),
        t("leafSpotCause2"),
        t("leafSpotCause3"),
        t("leafSpotCause4"),
        t("leafSpotCause5"),
      ],
      treatment: [
        t("leafSpotTreatment1"),
        t("leafSpotTreatment2"),
        t("leafSpotTreatment3"),
        t("leafSpotTreatment4"),
        t("leafSpotTreatment5"),
        t("leafSpotTreatment6"),
      ],
      prevention: [
        t("leafSpotPrevention1"),
        t("leafSpotPrevention2"),
        t("leafSpotPrevention3"),
        t("leafSpotPrevention4"),
        t("leafSpotPrevention5"),
        t("leafSpotPrevention6"),
      ],
      spreadRisk: t("medium"),
    },
    [t("sunburn")]: {
      category: t("environmentalCategory"),
      severity: t("medium"),
      description: t("sunburnDescription"),
      causes: [
        t("sunburnCause1"),
        t("sunburnCause2"),
        t("sunburnCause3"),
        t("sunburnCause4"),
        t("sunburnCause5"),
      ],
      treatment: [
        t("sunburnTreatment1"),
        t("sunburnTreatment2"),
        t("sunburnTreatment3"),
        t("sunburnTreatment4"),
        t("sunburnTreatment5"),
        t("sunburnTreatment6"),
      ],
      prevention: [
        t("sunburnPrevention1"),
        t("sunburnPrevention2"),
        t("sunburnPrevention3"),
        t("sunburnPrevention4"),
        t("sunburnPrevention5"),
        t("sunburnPrevention6"),
      ],
      spreadRisk: t("none"),
    },
  } as const;

  const [expanded, setExpanded] = useState({
    causes: false,
    treatment: true,
    prevention: false,
  });

  const diseaseKey = disease as string;
  const diseaseInfo =
    diseaseData[diseaseKey as keyof typeof diseaseData] || {
      category: t("unknownCategory"),
      severity: t("unknownSeverity"),
      description: t("diseaseInfoUnavailable"),
      causes: [],
      treatment: [t("consultAgriculturalExpert")],
      prevention: [t("regularMonitoringRecommended")],
      spreadRisk: t("unknownSeverity"),
    };

  const confidenceNum = Number(confidence) * 100;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
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
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case t("healthySeverity"):
        return "#2E7D32";
      case t("low"):
        return "#FBC02D";
      case t("medium"):
        return "#F57C00";
      case t("high"):
        return "#E64A19";
      case t("critical"):
        return "#C62828";
      default:
        return "#757575";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case t("none"):
        return "#2E7D32";
      case t("low"):
        return "#FBC02D";
      case t("medium"):
        return "#F57C00";
      case t("high"):
        return "#D32F2F";
      default:
        return "#757575";
    }
  };

  const toggleSection = (section: "causes" | "treatment" | "prevention") => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
      <LinearGradient
        colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1B5E20" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <View style={styles.resultHeaderLeft}>
                <Text style={styles.diseaseName}>{disease}</Text>
                <Text style={styles.category}>{diseaseInfo.category}</Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Ionicons name="analytics" size={20} color="#2E7D32" />
                <View>
                  <Text style={styles.confidenceLabel}>{t("confidence")}</Text>
                  <Text style={styles.confidenceValue}>
                    {confidenceNum.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons
                  name="speedometer"
                  size={18}
                  color={getSeverityColor(diseaseInfo.severity)}
                />
                <Text style={styles.statLabel}>{t("severity")}</Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: getSeverityColor(diseaseInfo.severity) },
                  ]}
                >
                  {diseaseInfo.severity}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons
                  name="warning"
                  size={18}
                  color={getRiskColor(diseaseInfo.spreadRisk)}
                />
                <Text style={styles.statLabel}>{t("spreadRisk")}</Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: getRiskColor(diseaseInfo.spreadRisk) },
                  ]}
                >
                  {diseaseInfo.spreadRisk}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>{t("aboutThisCondition")}</Text>
            </View>
            <Text style={styles.description}>{diseaseInfo.description}</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.treatmentCard,
              { opacity: fadeAnim },
            ]}
          >
            <TouchableOpacity
              style={styles.cardHeaderButton}
              onPress={() => toggleSection("treatment")}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="medical" size={24} color="#FFFFFF" />
                <Text style={[styles.cardTitle, styles.cardTitleWhite]}>
                  {t("recommendedTreatment")}
                </Text>
              </View>
              <Ionicons
                name={expanded.treatment ? "chevron-up" : "chevron-down"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            {expanded.treatment && (
              <View style={styles.cardContent}>
                {diseaseInfo.treatment.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bulletWhite}>
                      <Text style={styles.bulletNumber}>{index + 1}</Text>
                    </View>
                    <Text style={styles.listTextWhite}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {diseaseInfo.causes.length > 0 && (
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              <TouchableOpacity
                style={styles.cardHeaderButton}
                onPress={() => toggleSection("causes")}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeaderLeft}>
                  <Ionicons name="search" size={24} color="#2E7D32" />
                  <Text style={styles.cardTitle}>{t("possibleCauses")}</Text>
                </View>
                <Ionicons
                  name={expanded.causes ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#2E7D32"
                />
              </TouchableOpacity>
              {expanded.causes && (
                <View style={styles.cardContent}>
                  {diseaseInfo.causes.map((item, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons
                        name="alert-circle"
                        size={16}
                        color="#F57C00"
                      />
                      <Text style={styles.listText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          )}

          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.cardHeaderButton}
              onPress={() => toggleSection("prevention")}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeaderLeft}>
                <Ionicons
                  name="shield-checkmark"
                  size={24}
                  color="#2E7D32"
                />
                <Text style={styles.cardTitle}>{t("preventionTips")}</Text>
              </View>
              <Ionicons
                name={expanded.prevention ? "chevron-up" : "chevron-down"}
                size={24}
                color="#2E7D32"
              />
            </TouchableOpacity>
            {expanded.prevention && (
              <View style={styles.cardContent}>
                {diseaseInfo.prevention.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#2E7D32"
                    />
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {diseaseInfo.spreadRisk === t("high") && (
            <Animated.View
              style={[styles.card, styles.alertCard, { opacity: fadeAnim }]}
            >
              <View style={styles.alertIconWrapper}>
                <Ionicons name="people" size={32} color="#2E7D32" />
              </View>
              <Text style={styles.alertTitle}>{t("communityDiseaseAlert")}</Text>
              <Text style={styles.alertText}>
                {t("communityDiseaseAlertText")}
              </Text>
              <TouchableOpacity
                style={styles.alertButton}
                activeOpacity={0.85}
                onPress={() => {
                  router.push({
                    pathname: "/disease-management/community-alert",
                    params: {
                      disease: disease,
                      severity: diseaseInfo.severity,
                      spreadRisk: diseaseInfo.spreadRisk,
                    },
                  });
                }}
              >
                <LinearGradient
                  colors={["#2E7D32", "#1B5E20"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.alertButtonGradient}
                >
                  <Ionicons
                    name="notifications"
                    size={22}
                    color="#FFFFFF"
                  />
                  <Text style={styles.alertButtonText}>
                    {t("alertNearbyFarmers")}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => router.push("/disease-management/history")}
              activeOpacity={0.85}
            >
              <Ionicons name="time-outline" size={22} color="#2E7D32" />
              <Text style={styles.secondaryActionText}>{t("viewHistory")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => router.replace("/disease-management/capture")}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#2E7D32", "#1B5E20"]}
                style={styles.primaryActionGradient}
              >
                <Ionicons name="camera" size={22} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>{t("scanAgain")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace("/(tabs)/home")}
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={20} color="#2E7D32" />
            <Text style={styles.homeButtonText}>{t("backToHome")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  resultHeaderLeft: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 4,
    lineHeight: 28,
  },
  category: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 10,
    color: "#4E6E4E",
    fontWeight: "600",
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E7D32",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: "#E0E0E0",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  treatmentCard: {
    backgroundColor: "#2E7D32",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1B5E20",
    flex: 1,
  },
  cardTitleWhite: {
    color: "#FFFFFF",
  },
  cardContent: {
    marginTop: 14,
    gap: 10,
  },
  description: {
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 22,
    marginTop: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletWhite: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  bulletNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2E7D32",
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 20,
  },
  listTextWhite: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20,
  },
  alertCard: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 5,
    borderLeftColor: "#2E7D32",
  },
  alertIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    alignSelf: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 8,
    textAlign: "center",
  },
  alertText: {
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 22,
    marginBottom: 16,
    textAlign: "center",
  },
  alertButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  alertButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  alertButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: "#2E7D32",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryActionText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryActionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
  },
  homeButtonText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "600",
  },
});