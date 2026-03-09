import { Link } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const FEATURES = [
  {
    href: "/yield",
    title: "Yield & Forecasting",
    subtitle: "Predict gel weight and harvest yield using ML models and soil data.",
    icon: "chart-timeline-variant" as const,
    iconLib: "mci",
    accent: "#2E7D32",
    gradient: ["#E8F5E9", "#C8E6C9"] as [string, string],
    iconBg: "#2E7D32",
    tag: "ML Powered",
    tagColor: "#2E7D32",
    tagBg: "#E8F5E9",
  },
  {
    href: "/disease-management",
    title: "Disease Detection",
    subtitle: "Scan leaf images with AI to identify diseases and get treatment advice.",
    icon: "leaf-circle-outline" as const,
    iconLib: "mci",
    accent: "#1565C0",
    gradient: ["#E3F2FD", "#BBDEFB"] as [string, string],
    iconBg: "#1565C0",
    tag: "AI Vision",
    tagColor: "#1565C0",
    tagBg: "#E3F2FD",
  },
  {
    href: "/fertilizer-management",
    title: "Fertilizer Plan",
    subtitle: "Get personalized nutrient schedules based on your soil profile and growth stage.",
    icon: "sprout-outline" as const,
    iconLib: "mci",
    accent: "#E65100",
    gradient: ["#FFF3E0", "#FFE0B2"] as [string, string],
    iconBg: "#E65100",
    tag: "Personalized",
    tagColor: "#E65100",
    tagBg: "#FFF3E0",
  },
  {
    href: "/price-management/overview",
    title: "Price Forecast",
    subtitle: "Track market trends and predict Aloe Vera leaf prices using real-time data.",
    icon: "trending-up" as const,
    iconLib: "ion",
    accent: "#6A1B9A",
    gradient: ["#F3E5F5", "#E1BEE7"] as [string, string],
    iconBg: "#6A1B9A",
    tag: "Market Data",
    tagColor: "#6A1B9A",
    tagBg: "#F3E5F5",
  },
];

function FeatureCard({
  feature,
  index,
  fadeAnim,
  slideAnim,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}) {
  const cardOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const cardTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <Animated.View
      style={{
        opacity: cardOpacity,
        transform: [{ translateY: cardTranslate }],
      }}
    >
      <Link href={feature.href as any} asChild>
        <TouchableOpacity activeOpacity={0.88} style={styles.card}>
          {/* Left accent bar */}
          <View style={[styles.cardAccentBar, { backgroundColor: feature.accent }]} />

          <View style={styles.cardInner}>
            {/* Icon circle */}
            <View style={[styles.iconCircle, { backgroundColor: feature.iconBg }]}>
              <LinearGradient
                colors={[`${feature.iconBg}cc`, feature.iconBg]}
                style={StyleSheet.absoluteFill}
                borderRadius={22}
              />
              {feature.iconLib === "mci" ? (
                <MaterialCommunityIcons
                  name={feature.icon as any}
                  size={28}
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons name={feature.icon as any} size={28} color="#FFFFFF" />
              )}
            </View>

            {/* Text content */}
            <View style={styles.cardText}>
              {/* Tag */}
              <View style={[styles.tag, { backgroundColor: feature.tagBg }]}>
                <Text style={[styles.tagText, { color: feature.tagColor }]}>
                  {feature.tag}
                </Text>
              </View>

              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
            </View>

            {/* Chevron */}
            <View style={[styles.chevronWrap, { backgroundColor: `${feature.accent}12` }]}>
              <Ionicons name="chevron-forward" size={18} color={feature.accent} />
            </View>
          </View>

          {/* Bottom gradient strip */}
          <LinearGradient
            colors={[...feature.gradient, "transparent"] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardBottomStrip}
          />
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(headerScale, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={["#E8F5E9", "#F1F8E9", "#FFFFFF"]} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ scale: headerScale }] },
          ]}
        >
          {/* Logo badge */}
          <View style={styles.logoBadge}>
            <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={StyleSheet.absoluteFill} borderRadius={20} />
            <MaterialCommunityIcons name="leaf" size={28} color="#FFFFFF" />
          </View>

          <Text style={styles.heading}>Aloe Green</Text>
          <Text style={styles.subheading}>Smart Support System for Aloe Vera</Text>

          {/* Status strip */}
          <View style={styles.statusStrip}>
            <View style={styles.statusItem}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>System Active</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <Ionicons name="cloud-done-outline" size={13} color="#4CAF50" />
              <Text style={styles.statusText}>Models Ready</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <Ionicons name="wifi-outline" size={13} color="#4CAF50" />
              <Text style={styles.statusText}>Connected</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Section Label ── */}
        <Animated.View
          style={[styles.sectionRow, { opacity: fadeAnim }]}
        >
          <Text style={styles.sectionLabel}>Features</Text>
          <View style={styles.sectionLine} />
        </Animated.View>

        {/* ── Feature Cards ── */}
        <View style={styles.cardsContainer}>
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.href}
              feature={feature}
              index={index}
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
            />
          ))}
        </View>

        {/* ── Footer ── */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <MaterialCommunityIcons name="leaf" size={14} color="#9E9E9E" />
          <Text style={styles.footerText}>Powered by ML & AI · Aloe Green v1.0</Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingTop: 64,
    paddingHorizontal: 18,
    paddingBottom: 48,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: -1,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 15,
    color: "#4E6E4E",
    fontWeight: "500",
    marginBottom: 20,
    textAlign: "center",
  },

  // Status strip
  statusStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4E6E4E",
  },
  statusDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#E0E0E0",
  },

  // Section label
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9E9E9E",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },

  // Cards
  cardsContainer: {
    gap: 14,
    marginBottom: 28,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 4,
    position: "relative",
  },
  cardAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    paddingLeft: 22,
    gap: 14,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#757575",
    lineHeight: 17,
    fontWeight: "400",
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardBottomStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.5,
  },

  // Footer
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