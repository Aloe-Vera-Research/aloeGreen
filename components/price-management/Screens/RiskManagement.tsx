import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Leaf,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ================= TYPES ================= */
type Disaster = "none" | "drought" | "flood" | "severe";

type RiskInfo = {
  label: string;
  color: string;
  bg: string;
  Icon: React.ElementType;
  title: string;
  description: string;
  recommendations: string[];
};

/* ================= COMPONENT ================= */
export default function RiskManagement() {
  // 🔁 Later this can come from sensors / ML model
  const [naturalDisaster] = React.useState<Disaster>("drought");

  const getRiskInfo = (d: Disaster): RiskInfo => {
    switch (d) {
      case "none":
        return {
          label: "Low Risk",
          color: "#15803d",
          bg: "#dcfce7",
          Icon: CheckCircle,
          title: "Normal Conditions",
          description: "Environmental conditions are stable for aloe cultivation.",
          recommendations: [
            "Continue standard irrigation practices",
            "Monitor soil moisture weekly",
            "Maintain nutrient balance",
          ],
        };

      case "drought":
        return {
          label: "Medium Risk",
          color: "#c2410c",
          bg: "#fed7aa",
          Icon: AlertTriangle,
          title: "Drought Detected",
          description:
            "Low rainfall and high temperatures may reduce crop yield.",
          recommendations: [
            "Implement drip irrigation to conserve water",
            "Apply mulch to retain soil moisture",
            "Monitor plants daily for stress signs",
            "Harvest early if plant health declines",
          ],
        };

      case "flood":
        return {
          label: "High Risk",
          color: "#1d4ed8",
          bg: "#dbeafe",
          Icon: AlertCircle,
          title: "Flood Warning",
          description:
            "Excess water may damage roots and increase disease risk.",
          recommendations: [
            "Improve field drainage immediately",
            "Avoid additional irrigation",
            "Monitor plants for fungal diseases",
            "Delay harvesting until water recedes",
          ],
        };

      default:
        return {
          label: "Critical Risk",
          color: "#991b1b",
          bg: "#fee2e2",
          Icon: AlertCircle,
          title: "Severe Weather Conditions",
          description:
            "Extreme environmental conditions may cause major losses.",
          recommendations: [
            "Harvest mature plants immediately",
            "Protect soil using covers or ridges",
            "Suspend new planting activities",
            "Follow official agricultural advisories",
          ],
        };
    }
  };

  const risk = getRiskInfo(naturalDisaster);
  const RiskIcon = risk.Icon;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* ================= HEADER ================= */}
        <View
          style={{
            backgroundColor: "#16a34a",
            paddingHorizontal: 20,
            paddingTop: 28,
            paddingBottom: 36,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Leaf size={28} color="#ffffff" />
            <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "700" }}>
              Risk Management
            </Text>
          </View>
          <Text
            style={{
              color: "#dcfce7",
              marginTop: 6,
              marginLeft: 38,
              fontSize: 13,
            }}
          >
            Environmental risk & mitigation overview
          </Text>
        </View>

        {/* ================= CURRENT RISK ================= */}
        <View
          style={{
            backgroundColor: "#ffffff",
            marginHorizontal: 16,
            marginTop: -20,
            padding: 20,
            borderRadius: 22,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
              Current Risk Level
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: risk.bg,
              }}
            >
              <RiskIcon size={14} color={risk.color} />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: risk.color,
                }}
              >
                {risk.label}
              </Text>
            </View>
          </View>

          <View style={{ alignItems: "center", marginTop: 24 }}>
            <View
              style={{
                width: 84,
                height: 84,
                borderRadius: 42,
                backgroundColor: risk.bg,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <RiskIcon size={40} color={risk.color} />
            </View>

            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
              {risk.title}
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: "#6b7280",
                textAlign: "center",
                marginTop: 8,
                lineHeight: 18,
              }}
            >
              {risk.description}
            </Text>
          </View>
        </View>

        {/* ================= IMPACT ================= */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
            Impact on Farm
          </Text>

          <ImpactCard
            icon={<TrendingDown size={20} color="#c2410c" />}
            bg="#fed7aa"
            title="Yield Impact"
            desc={
              naturalDisaster === "none"
                ? "No yield reduction expected."
                : "Yield may decrease by 15–30%."
            }
          />

          <ImpactCard
            icon={<TrendingUp size={20} color="#15803d" />}
            bg="#dcfce7"
            title="Market Price Impact"
            desc={
              naturalDisaster === "none"
                ? "Prices remain stable."
                : "Prices may increase due to reduced supply."
            }
          />
        </View>

        {/* ================= RECOMMENDATIONS ================= */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
            Recommended Actions
          </Text>

          {risk.recommendations.map((rec, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                backgroundColor: "#ffffff",
                padding: 14,
                borderRadius: 16,
                marginBottom: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 18 }}>•</Text>
              <Text style={{ flex: 1, fontSize: 13, color: "#374151" }}>
                {rec}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= SMALL COMPONENT ================= */

function ImpactCard({
  icon,
  bg,
  title,
  desc,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  desc: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 14,
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
          {title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "#6b7280",
            marginTop: 4,
            lineHeight: 16,
          }}
        >
          {desc}
        </Text>
      </View>
    </View>
  );
}
