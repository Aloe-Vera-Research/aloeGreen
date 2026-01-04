import { useEffect, useRef } from "react";
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

const { width } = Dimensions.get("window");

export default function FertilizerManagementIntro() {
  const router = useRouter();
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

    // Subtle rotating animation for the icon
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

  const features = [
    {
      icon: "flask" as const,
      title: "Smart Analysis",
      description: "AI-powered soil & plant assessment",
    },
    {
      icon: "hardware-chip" as const,
      title: "IoT Integration",
      description: "Real-time sensor data monitoring",
    },
    {
      icon: "nutrition" as const,
      title: "Custom Plans",
      description: "Personalized fertilizer recommendations",
    },
  ];

  return (
    <LinearGradient
      colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
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
              <Ionicons name="flask" size={72} color="#2E7D32" />
            </View>
          </Animated.View>

          <Text style={styles.mainTitle}>Fertilizer</Text>
          <Text style={styles.subtitle}>Management System</Text>
        </Animated.View>

        {/* Main Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.cardTitle}>Optimize Your Crop Nutrition</Text>
          <Text style={styles.description}>
            Get data-driven fertilizer recommendations tailored to your Aloe Vera
            farm. Our system analyzes soil conditions, plant growth stages, and
            real-time IoT sensor data to create the perfect nutrition plan.
          </Text>

          {/* Feature Pills */}
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

          {/* What You'll Get Section */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>What You'll Get:</Text>
            <View style={styles.benefitsList}>
              {[
                "NPK (Nitrogen, Phosphorus, Potassium) level analysis",
                "Soil pH and moisture recommendations",
                "Stage-specific fertilizer dosage",
                "Application timing and methods",
              ].map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.button}
            onPress={() => router.push("/fertilizer-management/select")}
          >
            <LinearGradient
              colors={["#2E7D32", "#1B5E20"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="flask" size={24} color="#fff" />
              <Text style={styles.buttonText}>Create Fertilizer Plan</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Action */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.secondaryButton}
            onPress={() => router.push("/fertilizer-management/history")}
          >
            <Ionicons name="document-text-outline" size={20} color="#2E7D32" />
            <Text style={styles.secondaryButtonText}>View Past Plans</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Info Banner */}
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
            Ensure IoT sensors are active for accurate readings
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
    marginBottom: 24,
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
  benefitsContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 12,
  },
  benefitsList: {
    gap: 10,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 20,
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