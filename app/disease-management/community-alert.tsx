import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";

type NearbyFarmer = {
  id: string;
  name: string;
  distance: string;
  phone: string;
  email: string;
  selected: boolean;
};

export default function CommunityAlertScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Get disease info from params
  const diseaseName = params.disease || "Aloe Rust (Fungal)";
  const severity = params.severity || "High";
  const spreadRisk = params.spreadRisk || "High";

  const [message, setMessage] = useState(
    `⚠️ DISEASE ALERT\n\nDisease: ${diseaseName}\nSeverity: ${severity}\nSpread Risk: ${spreadRisk}\n\nI've detected this disease on my Aloe Vera farm. Please check your plants and take preventive measures immediately.\n\nStay safe! 🌱`
  );
  const [includeLocation, setIncludeLocation] = useState(true);
  const [urgentAlert, setUrgentAlert] = useState(severity === "High" || severity === "Critical");
  const [sending, setSending] = useState(false);
  const [selectAll, setSelectAll] = useState(true);

  const [nearbyFarmers, setNearbyFarmers] = useState<NearbyFarmer[]>([
    {
      id: "1",
      name: "Rajesh Kumar",
      distance: "0.5 km",
      phone: "+94 77 123 4567",
      email: "rajesh@example.com",
      selected: true,
    },
    {
      id: "2",
      name: "Priya Silva",
      distance: "1.2 km",
      phone: "+94 76 234 5678",
      email: "priya@example.com",
      selected: true,
    },
    {
      id: "3",
      name: "Amal Perera",
      distance: "2.0 km",
      phone: "+94 75 345 6789",
      email: "amal@example.com",
      selected: true,
    },
    {
      id: "4",
      name: "Nimal Fernando",
      distance: "2.8 km",
      phone: "+94 77 456 7890",
      email: "nimal@example.com",
      selected: true,
    },
    {
      id: "5",
      name: "Sanduni Dias",
      distance: "3.5 km",
      phone: "+94 76 567 8901",
      email: "sanduni@example.com",
      selected: true,
    },
  ]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
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

  const toggleFarmer = (id: string) => {
    setNearbyFarmers((prev) =>
      prev.map((farmer) =>
        farmer.id === id ? { ...farmer, selected: !farmer.selected } : farmer
      )
    );
    setSelectAll(false);
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setNearbyFarmers((prev) =>
      prev.map((farmer) => ({ ...farmer, selected: newSelectAll }))
    );
  };

  const selectedCount = nearbyFarmers.filter((f) => f.selected).length;

  const handleSendAlert = async () => {
    if (selectedCount === 0) {
      Alert.alert("No Recipients", "Please select at least one farmer to notify.");
      return;
    }

    setSending(true);

    // Simulate sending alerts
    setTimeout(() => {
      setSending(false);
      Alert.alert(
        "Alert Sent Successfully! ✅",
        `Disease alert has been sent to ${selectedCount} nearby farmer${
          selectedCount > 1 ? "s" : ""
        }.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }, 2000);

    // TODO: Implement actual backend API call here
    // await sendCommunityAlert({
    //   recipients: nearbyFarmers.filter(f => f.selected),
    //   message,
    //   disease: diseaseName,
    //   severity,
    //   includeLocation,
    //   urgentAlert,
    // });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
      <LinearGradient
        colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
        style={styles.container}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Community Alert</Text>
            <Text style={styles.headerSubtitle}>Notify nearby farmers</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Alert Info Card */}
          <Animated.View
            style={[
              styles.card,
              styles.alertInfoCard,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.alertIconWrapper}>
              <Ionicons name="warning" size={32} color="#F57C00" />
            </View>
            <Text style={styles.alertInfoTitle}>Disease Alert</Text>
            <View style={styles.alertInfoRow}>
              <Text style={styles.alertInfoLabel}>Disease:</Text>
              <Text style={styles.alertInfoValue}>{diseaseName}</Text>
            </View>
            <View style={styles.alertInfoRow}>
              <Text style={styles.alertInfoLabel}>Severity:</Text>
              <Text style={[styles.alertInfoValue, styles.severityText]}>
                {severity}
              </Text>
            </View>
            <View style={styles.alertInfoRow}>
              <Text style={styles.alertInfoLabel}>Spread Risk:</Text>
              <Text style={[styles.alertInfoValue, styles.riskText]}>
                {spreadRisk}
              </Text>
            </View>
          </Animated.View>

          {/* Message Card */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="chatbox-ellipses" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Alert Message</Text>
            </View>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
              placeholder="Type your message..."
              placeholderTextColor="#999"
            />
            <Text style={styles.characterCount}>{message.length} characters</Text>
          </Animated.View>

          {/* Options Card */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="settings" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Alert Options</Text>
            </View>
            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <Ionicons name="location" size={20} color="#2E7D32" />
                <Text style={styles.optionText}>Include my location</Text>
              </View>
              <Switch
                value={includeLocation}
                onValueChange={setIncludeLocation}
                trackColor={{ false: "#D0D0D0", true: "#81C784" }}
                thumbColor={includeLocation ? "#2E7D32" : "#f4f3f4"}
              />
            </View>
            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <Ionicons name="alert-circle" size={20} color="#F57C00" />
                <Text style={styles.optionText}>Mark as urgent</Text>
              </View>
              <Switch
                value={urgentAlert}
                onValueChange={setUrgentAlert}
                trackColor={{ false: "#D0D0D0", true: "#FFB74D" }}
                thumbColor={urgentAlert ? "#F57C00" : "#f4f3f4"}
              />
            </View>
          </Animated.View>

          {/* Nearby Farmers Card */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="people" size={24} color="#2E7D32" />
                <Text style={styles.cardTitle}>
                  Nearby Farmers ({selectedCount}/{nearbyFarmers.length})
                </Text>
              </View>
              <TouchableOpacity
                onPress={toggleSelectAll}
                style={styles.selectAllButton}
                activeOpacity={0.7}
              >
                <Text style={styles.selectAllText}>
                  {selectAll ? "Deselect All" : "Select All"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.farmersContainer}>
              {nearbyFarmers.map((farmer) => (
                <TouchableOpacity
                  key={farmer.id}
                  style={[
                    styles.farmerItem,
                    farmer.selected && styles.farmerItemSelected,
                  ]}
                  onPress={() => toggleFarmer(farmer.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      farmer.selected && styles.checkboxSelected,
                    ]}
                  >
                    {farmer.selected && (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={styles.farmerInfo}>
                    <Text style={styles.farmerName}>{farmer.name}</Text>
                    <View style={styles.farmerDetails}>
                      <Ionicons name="location" size={14} color="#666" />
                      <Text style={styles.farmerDistance}>{farmer.distance}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Ionicons name="information-circle" size={18} color="#2E7D32" />
            <Text style={styles.infoNoteText}>
              Alerts will be sent via SMS and in-app notifications. Farmers can
              respond with their status.
            </Text>
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSendAlert}
            activeOpacity={0.85}
            disabled={sending}
          >
            <LinearGradient
              colors={sending ? ["#81C784", "#66BB6A"] : ["#2E7D32", "#1B5E20"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButtonGradient}
            >
              {sending ? (
                <>
                  <Ionicons name="hourglass" size={24} color="#FFFFFF" />
                  <Text style={styles.sendButtonText}>Sending...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={24} color="#FFFFFF" />
                  <Text style={styles.sendButtonText}>
                    Send Alert to {selectedCount} Farmer{selectedCount !== 1 ? "s" : ""}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
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
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1B5E20",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#4E6E4E",
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  alertInfoCard: {
    backgroundColor: "#FFF3E0",
    borderLeftWidth: 5,
    borderLeftColor: "#F57C00",
    alignItems: "center",
  },
  alertIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#F57C00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  alertInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E65100",
    marginBottom: 12,
  },
  alertInfoRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  alertInfoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  alertInfoValue: {
    fontSize: 14,
    color: "#1B5E20",
    fontWeight: "700",
  },
  severityText: {
    color: "#E64A19",
  },
  riskText: {
    color: "#D32F2F",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
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
  selectAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
  },
  messageInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#1B5E20",
    minHeight: 140,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 6,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  optionText: {
    fontSize: 15,
    color: "#1B5E20",
    fontWeight: "600",
  },
  farmersContainer: {
    gap: 10,
  },
  farmerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F9F9F9",
    borderRadius: 14,
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  farmerItemSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#81C784",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D0D0D0",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 4,
  },
  farmerDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  farmerDistance: {
    fontSize: 13,
    color: "#666",
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 13,
    color: "#4E6E4E",
    lineHeight: 20,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(232, 245, 233, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(129, 199, 132, 0.3)",
  },
  sendButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});