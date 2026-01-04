import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  Animated,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Module = {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: string[];
};

type TeamMember = {
  name: string;
  role: string;
  image: any;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export default function AboutScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const modules: Module[] = [
    {
      id: 1,
      title: "Yield & Forecasting",
      description: "Predict Aloe Vera yield using weather patterns, soil data, and seasonal trends",
      icon: "bar-chart",
      color: "#2E7D32",
      gradient: ["#66BB6A", "#43A047"],
    },
    {
      id: 2,
      title: "Disease Detection",
      description: "Detect diseases using leaf images and farmer-reported symptoms with AI",
      icon: "leaf",
      color: "#F57C00",
      gradient: ["#FFA726", "#FB8C00"],
    },
    {
      id: 3,
      title: "Fertilizer Plan",
      description: "Personalized fertilizer plans based on plant age, soil nutrients, and season",
      icon: "water",
      color: "#1976D2",
      gradient: ["#42A5F5", "#1E88E5"],
    },
    {
      id: 4,
      title: "Price Forecasting",
      description: "Predict market prices for Aloe Vera leaves based on regional and historical data",
      icon: "trending-up",
      color: "#7B1FA2",
      gradient: ["#AB47BC", "#8E24AA"],
    },
  ];

  const team: TeamMember[] = [
    {
      name: "Eesara Megasooriya",
      role: "Tech Lead",
      image: require("../../assets/images/eesara.jpg"),
      icon: "code-slash",
      color: "#2E7D32",
    },
    {
      name: "Himash Rajapaksha",
      role: "Senior Developer",
      image: require("../../assets/images/himash.jpg"),
      icon: "laptop",
      color: "#1976D2",
    },
    {
      name: "Shehani Samarathunga",
      role: "QA Lead",
      image: require("../../assets/images/shehani.jpg"),
      icon: "checkmark-done-circle",
      color: "#F57C00",
    },
    {
      name: "Amanda Bandara",
      role: "Senior Business Analyst",
      image: require("../../assets/images/amanda.jpg"),
      icon: "business",
      color: "#7B1FA2",
    },
  ];

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
    ]).start();
  }, []);

  const ModuleCard = ({ module, index }: { module: Module; index: number }) => {
    const cardFadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.moduleCard,
            {
              opacity: cardFadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={module.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.moduleGradient}
          >
            <View style={styles.moduleIconBadge}>
              <Ionicons name={module.icon} size={28} color={module.color} />
            </View>
            <View style={styles.moduleContent}>
              <View style={styles.moduleHeader}>
                <View style={styles.moduleNumber}>
                  <Text style={styles.moduleNumberText}>{module.id}</Text>
                </View>
                <Text style={styles.moduleTitle}>{module.title}</Text>
              </View>
              <Text style={styles.moduleDescription}>{module.description}</Text>
            </View>
            <View style={styles.moduleArrow}>
              <Ionicons name="arrow-forward-circle" size={24} color="rgba(255,255,255,0.8)" />
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const TeamMemberCard = ({ member, index }: { member: TeamMember; index: number }) => {
    const cardFadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.memberWrapper}
      >
        <Animated.View
          style={[
            styles.memberCard,
            {
              opacity: cardFadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.memberImageContainer}>
            <Image source={member.image} style={styles.memberImage} />
            <View style={[styles.memberIconBadge, { backgroundColor: member.color }]}>
              <Ionicons name={member.icon} size={18} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.memberName} numberOfLines={2}>
            {member.name}
          </Text>
          <Text style={styles.memberRole}>{member.role}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.heroCard}>
              <LinearGradient
                colors={["#2E7D32", "#1B5E20"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <View style={styles.heroIconWrapper}>
                  <Ionicons name="leaf" size={40} color="#81C784" />
                </View>
                <Text style={styles.heroTitle}>Aloe Green</Text>
                <Text style={styles.heroSubtitle}>
                  Smart Support System for Aloe Vera
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.descriptionCard}>
              <View style={styles.descriptionHeader}>
                <Ionicons name="information-circle" size={24} color="#2E7D32" />
                <Text style={styles.descriptionTitle}>About Our Platform</Text>
              </View>
              <Text style={styles.description}>
                This mobile research application provides a comprehensive AI-powered
                solution for Aloe Vera farmers. It combines disease detection, yield
                forecasting, fertilizer recommendations, and price prediction to help
                farmers make informed decisions and improve crop productivity.
              </Text>
            </View>
          </Animated.View>

          {/* Core Modules Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="grid" size={24} color="#1B5E20" />
              <Text style={styles.sectionTitle}>Core Modules</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Four powerful features to enhance your farming
            </Text>

            <View style={styles.modulesContainer}>
              {modules.map((module, index) => (
                <ModuleCard key={module.id} module={module} index={index} />
              ))}
            </View>
          </Animated.View>

          {/* Team Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={24} color="#1B5E20" />
              <Text style={styles.sectionTitle}>Meet Our Team</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Dedicated professionals behind this innovation
            </Text>

            <View style={styles.teamGrid}>
              {team.map((member, index) => (
                <TeamMemberCard key={index} member={member} index={index} />
              ))}
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerIconWrapper}>
              <Ionicons name="heart" size={20} color="#C62828" />
            </View>
            <Text style={styles.footerText}>
              Made with passion for Aloe Vera farmers
            </Text>
            <Text style={styles.footerCopyright}>© 2025 Aloe Green Team</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
  },
  heroCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  heroGradient: {
    padding: 32,
    alignItems: "center",
  },
  heroIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#C8E6C9",
    textAlign: "center",
    fontWeight: "600",
  },
  descriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
  },
  description: {
    fontSize: 15,
    color: "#4E6E4E",
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1B5E20",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#4E6E4E",
    marginBottom: 20,
    fontWeight: "500",
  },
  modulesContainer: {
    gap: 14,
  },
  moduleCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  moduleGradient: {
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  moduleIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  moduleContent: {
    flex: 1,
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  moduleNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  moduleNumberText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    flex: 1,
  },
  moduleDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 19,
  },
  moduleArrow: {
    marginLeft: 4,
  },
  teamGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  memberWrapper: {
    width: "48%",
  },
  memberCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memberImageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  memberImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#E8F5E9",
  },
  memberIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  memberName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 20,
  },
  memberRole: {
    fontSize: 12,
    color: "#4E6E4E",
    textAlign: "center",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  footerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footerText: {
    fontSize: 14,
    color: "#4E6E4E",
    fontWeight: "600",
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: 12,
    color: "#81C784",
    fontWeight: "500",
  },
});