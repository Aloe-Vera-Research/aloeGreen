import { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../context/LanguageContext";

const { width } = Dimensions.get("window");

export default function DiseaseManagementIntro() {
  const router = useRouter();
  const { t } = useLanguage();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;

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
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconRotate, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotation = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-5deg", "5deg"],
  });

  const features = useMemo(
    () => [
      {
        icon: "scan-circle" as const,
        title: t("aiDetection"),
        description: t("advancedImageRecognition"),
      },
      {
        icon: "shield-checkmark" as const,
        title: t("earlyPrevention"),
        description: t("stopDiseaseSpreadQuickly"),
      },
      {
        icon: "people" as const,
        title: t("communityAlert"),
        description: t("notifyNearbyFarmers"),
      },
    ],
    [t]
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
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                transform: [{ scale: scaleAnim }, { rotate: rotation }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="leaf" size={72} color="#2E7D32" />
            </View>
          </Animated.View>

          <Text style={styles.mainTitle}>{t("aloeVera")}</Text>
          <Text style={styles.subtitle}>{t("diseaseDetectionSystem")}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.cardTitle}>{t("protectYourFarm")}</Text>
          <Text style={styles.description}>
            {t("diseaseIntroDescription")}
          </Text>

          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featurePill,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 40],
                          outputRange: [0, 40 + index * 10],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.featureIconBg}>
                  <Ionicons name={feature.icon} size={24} color="#2E7D32" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.button}
            onPress={() => router.push("/disease-management/capture")}
          >
            <LinearGradient
              colors={["#2E7D32", "#1B5E20"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.buttonText}>{t("startScanning")}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.secondaryButton}
            onPress={() => router.push("/disease-management/history")}
          >
            <Ionicons name="time-outline" size={20} color="#2E7D32" />
            <Text style={styles.secondaryButtonText}>{t("viewScanHistory")}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.infoBanner,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Ionicons name="information-circle" size={20} color="#1B5E20" />
          <Text style={styles.infoText}>
            {t("scanLeavesGoodLighting")}
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "600",
    marginTop: 4,
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
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#4E6E4E",
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 28,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8F4",
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  featureIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: "#4E6E4E",
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "600",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1B5E20",
    fontWeight: "500",
  },
});