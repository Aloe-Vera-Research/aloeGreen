import { useEffect, useRef, useState } from "react";
import { Link } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2; // 20px padding on each side + 12px gap

type CardData = {
  id: string;
  title: string;
  subtitle: string;
  image: any;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: string[];
  enabled: boolean;
};

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [greeting, setGreeting] = useState("Good Morning");

  const cards: CardData[] = [
    {
      id: "1",
      title: "Yield & Forecasting",
      subtitle: "Predict yield based on conditions",
      image: require("../../assets/images/yield.png"),
      href: "/yield",
      icon: "bar-chart",
      color: "#2E7D32",
      gradient: ["#66BB6A", "#43A047"],
      enabled: false,
    },
    {
      id: "2",
      title: "Disease Detection",
      subtitle: "AI-powered disease scanning",
      image: require("../../assets/images/disease.png"),
      href: "/disease-management",
      icon: "leaf",
      color: "#F57C00",
      gradient: ["#FFA726", "#FB8C00"],
      enabled: true,
    },
    {
      id: "3",
      title: "Fertilizer Plan",
      subtitle: "Personalized recommendations",
      image: require("../../assets/images/fertilizer.png"),
      href: "/fertilizer",
      icon: "water",
      color: "#1976D2",
      gradient: ["#42A5F5", "#1E88E5"],
      enabled: true,
    },
    {
      id: "4",
      title: "Price Forecast",
      subtitle: "Market price predictions",
      image: require("../../assets/images/price.webp"),
      href: "/pricing",
      icon: "trending-up",
      color: "#7B1FA2",
      gradient: ["#AB47BC", "#8E24AA"],
      enabled: false,
    },
  ];

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Entrance animations
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

  const CardComponent = ({ card, index }: { card: CardData; index: number }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const cardFadeAnim = useRef(new Animated.Value(0)).current;

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

    const CardContent = (
      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardFadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.cardImageContainer}>
          <Image source={card.image} style={styles.cardImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.cardImageOverlay}
          />
          {!card.enabled && (
            <View style={styles.lockOverlay}>
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
              </View>
            </View>
          )}
        </View>

        <LinearGradient
          colors={card.enabled ? card.gradient : ["#BDBDBD", "#9E9E9E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardContent}
        >
          <View style={styles.cardIconBadge}>
            <Ionicons name={card.icon} size={24} color="#FFFFFF" />
          </View>

          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {card.title}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {card.subtitle}
            </Text>
          </View>

          {!card.enabled && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          )}

          <View style={styles.cardArrow}>
            <Ionicons
              name="arrow-forward-circle"
              size={28}
              color="rgba(255,255,255,0.9)"
            />
          </View>
        </LinearGradient>
      </Animated.View>
    );

    if (card.enabled) {
      return (
        <Link href={card.href} asChild>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.cardWrapper}
          >
            {CardContent}
          </TouchableOpacity>
        </Link>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!card.enabled}
        style={styles.cardWrapper}
      >
        {CardContent}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
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
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{greeting} 👋</Text>
                <Text style={styles.heading}>Aloe Green</Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color="#1B5E20" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>

            <Text style={styles.subheading}>
              Smart Support System for Aloe Vera Farming
            </Text>

            {/* Quick Stats Card */}
            <View style={styles.statsCard}>
              <LinearGradient
                colors={["#2E7D32", "#1B5E20"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statsGradient}
              >
                <View style={styles.statItem}>
                  <Ionicons name="leaf" size={24} color="#81C784" />
                  <View>
                    <Text style={styles.statValue}>4</Text>
                    <Text style={styles.statLabel}>Features</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="shield-checkmark" size={24} color="#81C784" />
                  <View>
                    <Text style={styles.statValue}>AI</Text>
                    <Text style={styles.statLabel}>Powered</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="people" size={24} color="#81C784" />
                  <View>
                    <Text style={styles.statValue}>24/7</Text>
                    <Text style={styles.statLabel}>Support</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Features Section Header */}
          <Animated.View
            style={[
              styles.sectionHeader,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Our Features</Text>
            <Text style={styles.sectionSubtitle}>
              Explore powerful tools for your farm
            </Text>
          </Animated.View>

          {/* Cards Grid (2x2) */}
          <View style={styles.cardsGrid}>
            {cards.map((card, index) => (
              <CardComponent key={card.id} card={card} index={index} />
            ))}
          </View>

          {/* Help Section */}
          <Animated.View
            style={[
              styles.helpCard,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.helpIconWrapper}>
              <Ionicons name="help-circle" size={32} color="#2E7D32" />
            </View>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              Our support team is here to assist you with any questions about Aloe
              Vera farming.
            </Text>
            <TouchableOpacity style={styles.helpButton} activeOpacity={0.8}>
              <Text style={styles.helpButtonText}>Contact Support</Text>
              <Ionicons name="chatbubbles" size={18} color="#2E7D32" />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: "#4E6E4E",
    fontWeight: "600",
    marginBottom: 4,
  },
  heading: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1B5E20",
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F44336",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  subheading: {
    fontSize: 14,
    color: "#4E6E4E",
    marginBottom: 20,
    lineHeight: 20,
  },
  statsCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statsGradient: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "#C8E6C9",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#4E6E4E",
    fontWeight: "500",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    height: 240,
  },
  cardImageContainer: {
    height: 100,
    position: "relative",
    overflow: "hidden",
  },
  cardImage: {
    width: "90%",
    height: "100%",
    resizeMode: "cover",
  },
  cardImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  cardContent: {
    flex: 1,
    padding: 14,
    position: "relative",
  },
  cardIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 16,
  },
  comingSoonBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cardArrow: {
    position: "absolute",
    bottom: 12,
    right: 12,
  },
  helpCard: {
    backgroundColor: "#E8F5E9",
    marginHorizontal: 20,
    marginTop: 24,
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: "#2E7D32",
  },
  helpIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#4E6E4E",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  helpButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E7D32", },
});