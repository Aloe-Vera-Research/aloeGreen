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
import * as Location from "expo-location";

export default function CommunityAlertScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const diseaseName = (params.disease as string) || "Aloe Rust";
  const severity = (params.severity as string) || "High";
  const spreadRisk = (params.spreadRisk as string) || "High";

  const [message, setMessage] = useState(
    `⚠️ DISEASE ALERT\n\nDisease: ${diseaseName}\nSeverity: ${severity}\nSpread Risk: ${spreadRisk}\n\nA disease has been detected in an Aloe Vera plant site. Please inspect nearby crops and take preventive action immediately.`
  );

  const [includeLocation, setIncludeLocation] = useState(true);
  const [urgentAlert, setUrgentAlert] = useState(
    severity === "High" || severity === "Critical"
  );
  const [sending, setSending] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

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

    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Location Error", "Could not fetch current location.");
    }
  };

  const handleSendAlert = async () => {
    if (severity !== "High" && severity !== "Critical") {
      Alert.alert(
        "Not Allowed",
        "Email alerts are only sent for High or Critical disease severity."
      );
      return;
    }

    try {
      setSending(true);

      const payload = {
        disease: diseaseName,
        severity,
        spread_risk: spreadRisk,
        message,
        latitude: includeLocation ? latitude : null,
        longitude: includeLocation ? longitude : null,
      };

      const response = await fetch(
        "http://192.168.1.4:8000/api/community-alert/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to send email alert");
      }

      Alert.alert(
        "Success",
        "Alert email sent to the agricultural office successfully.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error("Send email error:", error);
      Alert.alert("Error", error.message || "Failed to send email alert.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
      <LinearGradient
        colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
        style={styles.container}
      >
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
            <Text style={styles.headerSubtitle}>
              Email agricultural office
            </Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.card, styles.alertInfoCard, { opacity: fadeAnim }]}>
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

            {latitude && longitude && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.alertInfoLabel}>Current Location:</Text>
                <Text style={styles.alertInfoValue}>
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </Text>
              </View>
            )}
          </Animated.View>

          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="chatbox-ellipses" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Email Message</Text>
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

          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="settings" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Options</Text>
            </View>

            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <Ionicons name="location" size={20} color="#2E7D32" />
                <Text style={styles.optionText}>Include current location</Text>
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
        </ScrollView>

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
                  <Ionicons name="mail" size={24} color="#FFFFFF" />
                  <Text style={styles.sendButtonText}>Send Email Alert</Text>
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
  container: { flex: 1 },
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
  headerContent: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#1B5E20" },
  headerSubtitle: { fontSize: 12, color: "#4E6E4E", marginTop: 2 },
  headerPlaceholder: { width: 44 },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
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
  alertInfoLabel: { fontSize: 14, color: "#666", fontWeight: "600" },
  alertInfoValue: { fontSize: 14, color: "#1B5E20", fontWeight: "700" },
  severityText: { color: "#E64A19" },
  riskText: { color: "#D32F2F" },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1B5E20",
    flex: 1,
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
  },
  sendButtonDisabled: { opacity: 0.7 },
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