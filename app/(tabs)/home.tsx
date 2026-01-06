import { Link } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={['#2E7D32', '#43A047', '#66BB6A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Aloe Green</Text>
            <Text style={styles.heroSubtitle}>Smart farming intelligence at your fingertips</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🌿 Powered by AI</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Core Features</Text>
          <Text style={styles.sectionSubtitle}>Choose a tool to get started</Text>
        </View>

        {/* Enhanced Cards */}
        <View style={styles.cardsContainer}>
          {/* Card 1: Yield & Forecasting */}
          <Link href="/yield" asChild>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Image 
                  source={require("../../assets/images/yield.png")} 
                  style={styles.cardImage} 
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Yield & Forecasting</Text>
                <Text style={styles.cardSubtitle}>
                  AI-powered predictions for optimal harvest planning
                </Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </Link>

          {/* Card 2: Disease Detection */}
          <Link href="/disease-management" asChild>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: '#FCE4EC' }]}>
                <Image 
                  source={require("../../assets/images/disease.png")} 
                  style={styles.cardImage} 
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Disease Detection</Text>
                <Text style={styles.cardSubtitle}>
                  Instant diagnosis through smart image analysis
                </Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </Link>

          {/* Card 3: Fertilizer Plan */}
          <Link href="/fertilizer-management" asChild>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Image 
                  source={require("../../assets/images/fertilizer.png")} 
                  style={styles.cardImage} 
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Fertilizer Plan</Text>
                <Text style={styles.cardSubtitle}>
                  Customized nutrient schedules for your soil
                </Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </Link>

          {/* Card 4: Price Forecast */}
          <Link href="/price-management/overview" asChild>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                <Image 
                  source={require("../../assets/images/price.webp")} 
                  style={styles.cardImage}
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Price Forecast</Text>
                <Text style={styles.cardSubtitle}>
                  Market insights to maximize your profits
                </Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All data is processed securely and kept private
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBF8",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#E8F5E9",
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.95,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#66BB6A",
    opacity: 0.8,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#F1F8F4',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#66BB6A",
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  arrow: {
    fontSize: 24,
    color: '#81C784',
    fontWeight: '300',
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#81C784',
    textAlign: 'center',
    opacity: 0.7,
  },
});