import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function AlertsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const alerts = [
    {
      id: 1,
      type: "critical",
      icon: "alert-circle",
      title: "Critical: Low Soil Moisture",
      description: "Soil moisture has dropped to 28%. Immediate irrigation required to prevent plant stress.",
      time: "5 minutes ago",
      color: "#F44336",
      bg: "#FFEBEE",
      action: "Irrigate Now",
    },
    {
      id: 2,
      type: "warning",
      icon: "thermometer",
      title: "High Temperature Alert",
      description: "Temperature reached 38°C. Consider providing shade or increasing irrigation frequency.",
      time: "1 hour ago",
      color: "#FF9800",
      bg: "#FFF3E0",
      action: "View Details",
    },
    {
      id: 3,
      type: "info",
      icon: "water",
      title: "Optimal Harvest Conditions",
      description: "Weather conditions are ideal for harvesting. Soil moisture and temperature within optimal ranges.",
      time: "3 hours ago",
      color: "#2196F3",
      bg: "#E3F2FD",
      action: "Schedule Harvest",
    },
    {
      id: 4,
      type: "success",
      icon: "trending-up",
      title: "Yield Improvement Detected",
      description: "Average yield increased by 5.2% this week. Current practices showing positive results.",
      time: "Yesterday",
      color: "#4CAF50",
      bg: "#E8F5E9",
      action: "View Report",
    },
    {
      id: 5,
      type: "warning",
      icon: "leaf",
      title: "Fertilizer Schedule Reminder",
      description: "Next fertilizer application due in 2 days. Ensure you have adequate supply.",
      time: "Yesterday",
      color: "#FF9800",
      bg: "#FFF3E0",
      action: "Mark Complete",
    },
  ];

  const activeAlerts = alerts.filter(a => a.type === "critical" || a.type === "warning");
  const alertSettings = [
    { id: 1, title: "Soil Moisture Alerts", description: "Get notified when moisture drops below threshold", enabled: true },
    { id: 2, title: "Temperature Warnings", description: "Alert when temperature exceeds safe limits", enabled: true },
    { id: 3, title: "Harvest Recommendations", description: "Receive optimal harvest timing suggestions", enabled: true },
    { id: 4, title: "Yield Updates", description: "Daily yield prediction summaries", enabled: false },
    { id: 5, title: "Maintenance Reminders", description: "Equipment and farm maintenance schedules", enabled: true },
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case "critical": return "alert-circle";
      case "warning": return "warning";
      case "info": return "information-circle";
      case "success": return "checkmark-circle";
      default: return "notifications";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Alerts & Notifications</Text>
              <Text style={styles.subtitle}>Stay informed about your farm</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={22} color="#2E7D32" />
            </TouchableOpacity>
          </View>

          {/* Notification Toggle */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleLeft}>
              <View style={styles.toggleIcon}>
                <Ionicons 
                  name={notificationsEnabled ? "notifications" : "notifications-off"} 
                  size={24} 
                  color="#2E7D32" 
                />
              </View>
              <View>
                <Text style={styles.toggleTitle}>Push Notifications</Text>
                <Text style={styles.toggleSubtext}>
                  {notificationsEnabled ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#E0E0E0", true: "#81C784" }}
              thumbColor={notificationsEnabled ? "#2E7D32" : "#f4f3f4"}
            />
          </View>

          {/* Active Alerts Summary */}
          {activeAlerts.length > 0 && (
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={["#F44336", "#D32F2F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.summaryGradient}
              >
                <View style={styles.summaryLeft}>
                  <Ionicons name="warning" size={32} color="#FFFFFF" />
                  <View>
                    <Text style={styles.summaryTitle}>Action Required</Text>
                    <Text style={styles.summaryText}>
                      {activeAlerts.length} urgent {activeAlerts.length === 1 ? "alert" : "alerts"} need attention
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.summaryButton}>
                  <Text style={styles.summaryButtonText}>Review</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {/* Alerts List */}
          <View style={styles.alertsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Alerts</Text>
              <TouchableOpacity>
                <Text style={styles.clearText}>Mark All Read</Text>
              </TouchableOpacity>
            </View>

            {alerts.map((alert) => (
              <View key={alert.id} style={[styles.alertCard, { backgroundColor: alert.bg }]}>
                <View style={[styles.alertIconWrapper, { backgroundColor: alert.color + "20" }]}>
                  <Ionicons name={alert.icon} size={24} color={alert.color} />
                </View>
                
                <View style={styles.alertContent}>
                  <View style={styles.alertHeader}>
                    <Text style={[styles.alertTitle, { color: alert.color }]}>
                      {alert.title}
                    </Text>
                    {(alert.type === "critical" || alert.type === "warning") && (
                      <View style={styles.alertBadge}>
                        <View style={[styles.alertDot, { backgroundColor: alert.color }]} />
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.alertDescription}>{alert.description}</Text>
                  
                  <View style={styles.alertFooter}>
                    <View style={styles.timeContainer}>
                      <Ionicons name="time-outline" size={14} color="#9E9E9E" />
                      <Text style={styles.alertTime}>{alert.time}</Text>
                    </View>
                    <TouchableOpacity style={[styles.actionButton, { borderColor: alert.color }]}>
                      <Text style={[styles.actionButtonText, { color: alert.color }]}>
                        {alert.action}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Alert Settings */}
          <View style={styles.settingsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Alert Preferences</Text>
            </View>

            <View style={styles.settingsCard}>
              {alertSettings.map((setting, index) => (
                <View key={setting.id}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <Text style={styles.settingTitle}>{setting.title}</Text>
                      <Text style={styles.settingDescription}>{setting.description}</Text>
                    </View>
                    <Switch
                      value={setting.enabled}
                      trackColor={{ false: "#E0E0E0", true: "#81C784" }}
                      thumbColor={setting.enabled ? "#2E7D32" : "#f4f3f4"}
                    />
                  </View>
                  {index < alertSettings.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              Alerts are generated based on real-time sensor data and ML predictions. 
              Adjust thresholds in farm settings to customize notifications.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#757575",
    fontWeight: "500",
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  toggleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 2,
  },
  toggleSubtext: {
    fontSize: 13,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  summaryCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#F44336",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryGradient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  summaryButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  summaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  alertsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
  },
  clearText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "600",
  },
  alertCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  alertIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  alertBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: "#616161",
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  alertTime: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingLeft: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: "#9E9E9E",
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1565C0",
    lineHeight: 19,
  },
});