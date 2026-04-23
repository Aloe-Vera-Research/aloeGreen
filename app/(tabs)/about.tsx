import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";

export default function AboutScreen() {
  const { t } = useLanguage();

  const MODULES = useMemo(
    () => [
      {
        number: "01",
        title: t("yieldForecastingTitle"),
        description: t("aboutYieldDescription"),
        icon: "chart-timeline-variant",
        iconLib: "mci" as const,
        accent: "#2E7D32",
        bg: "#E8F5E9",
      },
      {
        number: "02",
        title: t("diseaseDetectionTitle"),
        description: t("aboutDiseaseDescription"),
        icon: "leaf-circle-outline",
        iconLib: "mci" as const,
        accent: "#1565C0",
        bg: "#E3F2FD",
      },
      {
        number: "03",
        title: t("fertilizerPlanTitle"),
        description: t("aboutFertilizerDescription"),
        icon: "sprout-outline",
        iconLib: "mci" as const,
        accent: "#E65100",
        bg: "#FFF3E0",
      },
      {
        number: "04",
        title: t("aboutPriceForecastingTitle"),
        description: t("aboutPriceDescription"),
        icon: "trending-up",
        iconLib: "ion" as const,
        accent: "#6A1B9A",
        bg: "#F3E5F5",
      },
    ],
    [t]
  );

  const TEAM = [
    {
      name: "Eesara Megasooriya",
      role: t("techLead"),
      image: require("../../assets/images/eesara.jpg"),
      icon: "code-slash-outline",
      accent: "#2E7D32",
      bg: "#E8F5E9",
    },
    {
      name: "Himash Rajapaksha",
      role: t("seniorDeveloper"),
      image: require("../../assets/images/himash.jpg"),
      icon: "terminal-outline",
      accent: "#1565C0",
      bg: "#E3F2FD",
    },
    {
      name: "Shehani Samarathunga",
      role: t("qaLead"),
      image: require("../../assets/images/shehani.jpg"),
      icon: "shield-checkmark-outline",
      accent: "#E65100",
      bg: "#FFF3E0",
    },
    {
      name: "Amanda Bandara",
      role: t("businessAnalyst"),
      image: require("../../assets/images/amanda.jpg"),
      icon: "bar-chart-outline",
      accent: "#6A1B9A",
      bg: "#F3E5F5",
    },
  ];

  const heroTags = [t("aiPowered"), t("mlModels"), t("researchApp")];

  const stats = [
    { value: "4", label: t("aiModules") },
    { value: "4", label: t("teamMembers") },
    { value: "v1.0", label: t("version") },
  ];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <LinearGradient colors={["#E8F5E9", "#F1F8E9", "#FFFFFF"]} style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={[
              styles.hero,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.logoBadge}>
              <LinearGradient
                colors={["#2E7D32", "#1B5E20"]}
                style={StyleSheet.absoluteFill}
                borderRadius={22}
              />
              <MaterialCommunityIcons name="leaf" size={32} color="#FFFFFF" />
            </View>

            <Text style={styles.heroTitle}>{t("appName")}</Text>
            <Text style={styles.heroSubtitle}>{t("appSubtitle")}</Text>

            <View style={styles.tagRow}>
              {heroTags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            style={[
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.aboutCard}>
              <View style={styles.cardTopLine} />
              <View style={styles.aboutHeader}>
                <View style={styles.aboutIconWrap}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#2E7D32"
                  />
                </View>
                <Text style={styles.cardSectionTitle}>{t("aboutThisApp")}</Text>
              </View>
              <Text style={styles.aboutText}>{t("aboutAppDescription")}</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.sectionRow, { opacity: fadeAnim }]}>
            <Text style={styles.sectionLabel}>{t("coreModules")}</Text>
            <View style={styles.sectionLine} />
          </Animated.View>

          <Animated.View
            style={[
              styles.modulesGrid,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {MODULES.map((mod) => (
              <View key={mod.number} style={styles.moduleCard}>
                <View
                  style={[styles.moduleCardAccent, { backgroundColor: mod.accent }]}
                />
                <View style={styles.moduleInner}>
                  <View style={styles.moduleTop}>
                    <View
                      style={[styles.moduleIconWrap, { backgroundColor: mod.bg }]}
                    >
                      {mod.iconLib === "mci" ? (
                        <MaterialCommunityIcons
                          name={mod.icon as any}
                          size={20}
                          color={mod.accent}
                        />
                      ) : (
                        <Ionicons
                          name={mod.icon as any}
                          size={20}
                          color={mod.accent}
                        />
                      )}
                    </View>
                    <Text
                      style={[styles.moduleNumber, { color: mod.accent + "40" }]}
                    >
                      {mod.number}
                    </Text>
                  </View>
                  <Text style={styles.moduleTitle}>{mod.title}</Text>
                  <Text style={styles.moduleDesc}>{mod.description}</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          <Animated.View style={[styles.sectionRow, { opacity: fadeAnim }]}>
            <Text style={styles.sectionLabel}>{t("ourTeam")}</Text>
            <View style={styles.sectionLine} />
          </Animated.View>

          <Animated.View
            style={[
              styles.teamGrid,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {TEAM.map((member) => (
              <View key={member.name} style={styles.memberCard}>
                <View
                  style={[
                    styles.memberCardTopLine,
                    { backgroundColor: member.accent },
                  ]}
                />

                <View
                  style={[
                    styles.avatarRing,
                    { borderColor: member.accent + "40" },
                  ]}
                >
                  <Image source={member.image} style={styles.avatar} />
                  <View
                    style={[
                      styles.avatarBadge,
                      { backgroundColor: member.bg },
                    ]}
                  >
                    <Ionicons
                      name={member.icon as any}
                      size={11}
                      color={member.accent}
                    />
                  </View>
                </View>

                <Text style={styles.memberName}>{member.name}</Text>

                <View style={[styles.rolePill, { backgroundColor: member.bg }]}>
                  <Text style={[styles.roleText, { color: member.accent }]}>
                    {member.role}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>

          <Animated.View
            style={[
              styles.statsStrip,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <LinearGradient
              colors={["#2E7D32", "#1B5E20"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
              borderRadius={20}
            />
            {stats.map((s, i) => (
              <View key={i} style={[styles.statItem, i < 2 && styles.statItemBorder]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </Animated.View>

          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <MaterialCommunityIcons name="leaf" size={14} color="#BDBDBD" />
            <Text style={styles.footerText}>{t("aboutFooter")}</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 12 : 20,
    paddingHorizontal: 18,
    paddingBottom: 48,
  },

  hero: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,
  },
  logoBadge: {
    width: 70,
    height: 70,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: -1,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#4E6E4E",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tag: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D32",
    letterSpacing: 0.3,
  },

  aboutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTopLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#2E7D32",
  },
  aboutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    marginTop: 6,
  },
  aboutIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1B5E20",
  },
  aboutText: {
    fontSize: 14,
    color: "#4E6E4E",
    lineHeight: 22,
    fontWeight: "400",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9E9E9E",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },

  modulesGrid: {
    gap: 12,
    marginBottom: 28,
  },
  moduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  moduleCardAccent: {
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  moduleInner: {
    flex: 1,
    padding: 16,
  },
  moduleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  moduleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleNumber: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  moduleDesc: {
    fontSize: 13,
    color: "#757575",
    lineHeight: 18,
  },

  teamGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  memberCard: {
    width: "47.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
  },
  memberCardTopLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
    position: "relative",
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  memberName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 18,
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  statsStrip: {
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 24,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 7,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
  },
  statItemBorder: {
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.15)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: "#BDBDBD",
    fontWeight: "500",
  },
});