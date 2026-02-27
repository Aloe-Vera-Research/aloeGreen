import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Leaf,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useAxios from "@/hooks/useAxios";

type RiskData = {
  latest: {
    date: string;
    productionQuantity: number;
    totalCost: number;
    farmerPrice: number;
    webPrice: number;
    naturalDisaster: string;
    priceDifference: number;
  };
  risk: {
    level: string;
    color: string;
    bg: string;
    icon: string;
    title: string;
    description: string;
    yield_impact: string;
    price_impact: string;
    recommendations: string[];
  };
};

const IconMap: Record<string, React.ElementType> = {
  AlertCircle: AlertCircle,
  AlertTriangle: AlertTriangle,
  CheckCircle: CheckCircle,
  TrendingDown: TrendingDown,
  TrendingUp: TrendingUp,
};

export default function RiskManagement() {
  const axios = useAxios();
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRiskAnalysis();
  }, [axios]);

  const fetchRiskAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/risk-analysis");
      if (res.data?.error) {
        setError(res.data.error);
        setRiskData(null);
      } else {
        setRiskData(res.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch risk analysis", err);
      setError("Failed to load risk analysis. Please try again.");
      setRiskData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading risk analysis...</Text>
      </SafeAreaView>
    );
  }

  if (error || !riskData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
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
        </View>
        <View style={{ padding: 20, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#dc2626", fontWeight: "600" }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const risk = riskData.risk;
  const latest = riskData.latest;
  const RiskIcon = IconMap[risk.icon] || AlertCircle;


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
            <View>
              <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "700" }}>
                Risk Management
              </Text>
              <Text style={{ color: "#dcfce7", marginTop: 6, fontSize: 13 }}>
                Latest: {latest.date} ({latest.productionQuantity} kg)
              </Text>
            </View>
          </View>
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
                {risk.level}
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
            desc={risk.yield_impact}
          />

          <ImpactCard
            icon={<TrendingUp size={20} color="#15803d" />}
            bg="#dcfce7"
            title="Market Price Impact"
            desc={risk.price_impact}
          />
        </View>

        {/* ================= FINANCIAL DATA ================= */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
            Current Data
          </Text>

          <DataRow label="Production Cost" value={`Rs. ${latest.totalCost.toLocaleString()}`} />
          <DataRow label="Farm Gate Price" value={`Rs. ${latest.farmerPrice}/kg`} />
          <DataRow label="Web Market Price" value={`Rs. ${latest.webPrice}/kg`} />
          <DataRow
            label="Price Difference"
            value={`Rs. ${latest.priceDifference}/kg`}
            color={latest.priceDifference >= 0 ? "#15803d" : "#dc2626"}
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

function DataRow({
  label,
  value,
  color = "#111827",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#f0f0f0",
      }}
    >
      <Text style={{ fontSize: 13, color: "#6b7280" }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "600", color }}>{value}</Text>
    </View>
  );
}
