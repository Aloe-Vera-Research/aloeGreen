import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Globe,
  Leaf,
  Package,
  ShoppingCart,
  Wallet,
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import useAxios from "@/hooks/useAxios";

const screenWidth = Dimensions.get("window").width;

export default function FarmOverview() {
  const router = useRouter();
  const axios = useAxios();

  const [period, setPeriod] = useState<"30days" | "6months" | "1year" | "all">("30days");
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);

  const [summary, setSummary] = useState<{
    totalProduction: number;
    averageFarmerPrice: number;
    records: number;
    recordsList: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // retrieve summary and records from backend
  useEffect(() => {
    fetchDashboard();
  }, [axios]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/dashboard");
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DATA ---------------- */
  // values are derived from the dashboard API result once loaded
  const rs = (v: number) => `Rs. ${v.toLocaleString()}`;

  if (loading || !summary) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading overview...</Text>
      </SafeAreaView>
    );
  }

  const latest = summary.recordsList[0] || null;
  const now = new Date();
  const filteredRecords = summary.recordsList.filter((rec) => {
    if (!rec.date) return false;
    const d = new Date(rec.date);
    const diff = now.getTime() - d.getTime();
    switch (period) {
      case "30days":
        return diff <= 30 * 24 * 60 * 60 * 1000;
      case "6months":
        return diff <= 183 * 24 * 60 * 60 * 1000;
      case "1year":
        return diff <= 365 * 24 * 60 * 60 * 1000;
      case "all":
      default:
        return true;
    }
  }) || [];


let sortedRecords = [...filteredRecords].sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
);


if (period === "1year" || period === "all") {
  const maxPoints = 20;

  if (sortedRecords.length > maxPoints) {
    const step = Math.ceil(sortedRecords.length / maxPoints);
    sortedRecords = sortedRecords.filter((_, index) => index % step === 0);
  }
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const allDates = sortedRecords.map((r) => r.date);
const farmerPrices = sortedRecords.map((r) => r.farmerPrice);
const webPrices = sortedRecords.map((r) => r.webPrice);

// Show only max 5 labels evenly spaced
const maxLabels = 5;
const labelStep =
  allDates.length > maxLabels
    ? Math.ceil(allDates.length / maxLabels)
    : 1;

const visibleLabels = allDates.map((label, index) => {
  if (index === 0) return formatDate(label); // first
  if (index === allDates.length - 1) return formatDate(label); // last
  if (index % labelStep === 0) return formatDate(label);
  return "";
});

const chartData = {
  labels: visibleLabels,
  datasets: [
    {
      data: farmerPrices,
      color: () => "#2563eb", 
      strokeWidth: 3,
    },
    {
      data: webPrices,
      color: () => "#16a34a", 
      strokeWidth: 3,
    },
  ],
};

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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {/* BACK BUTTON */}
            <Pressable
              onPress={() => router.replace("/home")}
              style={{
                padding: 6,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            >
              <ArrowLeft size={22} color="#fff" />
            </Pressable>

            {/* TITLE */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Leaf size={28} color="#fff" />
              <Text style={{ fontSize: 22, fontWeight: "700", color: "#fff" }}>
                Aloe Green – Farm Overview
              </Text>
            </View>
          </View>

          <Text style={{ marginTop: 6, color: "#dcfce7", fontSize: 13 }}>
            Production, cost & price insights
          </Text>
        </View>

        {/* ================= SUMMARY CARDS ================= */}
        <View
          style={{
            marginTop: -26,
            paddingHorizontal: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <SummaryCard
            icon={<Package size={18} color="#16a34a" />}
            label="Production Quantity"
            value={latest ? `${latest.productionQuantity}` : "-"}
            unit="kg"
            bg="#f0fdf4"
          />
          <SummaryCard
            icon={<ShoppingCart size={18} color="#2563eb" />}
            label="Farm Gate Price"
            value={latest ? rs(latest.farmerPrice) : "-"}
            unit="/ kg"
            bg="#eff6ff"
          />
          <SummaryCard
            icon={<Globe size={18} color="#059669" />}
            label="Web Market Price"
            value={latest ? rs(latest.webPrice) : "-"}
            unit="/ kg"
            bg="#ecfdf5"
          />
          <SummaryCard
            icon={<Wallet size={18} color="#92400e" />}
            label="Production Cost"
            value={latest ? rs(latest.totalCost) : "-"}
            unit="total"
            bg="#fffbeb"
          />
        </View>

        {/* ================= PRICE TREND HEADER ================= */}
        <View
          style={{
            marginTop: 22,
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827" }}>
            Price Trend
          </Text>

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <PillButton
              text="30 Days"
              active={period === "30days"}
              onPress={() => setPeriod("30days")}
            />
            <PillButton
              text="6 Months"
              active={period === "6months"}
              onPress={() => setPeriod("6months")}
            />
            <PillButton
              text="1 Year"
              active={period === "1year"}
              onPress={() => setPeriod("1year")}
            />
            <PillButton
              text="All"
              active={period === "all"}
              onPress={() => setPeriod("all")}
            />
          </View>
        </View>

        {/* ================= CHART CARD ================= */}
        <View
          style={{
            margin: 16,
            backgroundColor: "#fff",
            borderRadius: 22,
            paddingVertical: 18,
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
              justifyContent: "center",
              gap: 18,
              marginBottom: 10,
            }}
          >
            <LegendDot color="#2563eb" label="Farm Gate Price" />
            <LegendDot color="#16a34a" label="Web Market Price" />
          </View>

          <View style={{ position: "relative" }}>
           {sortedRecords.length === 0 ? (
  <View style={{ paddingVertical: 40 }}>
    <Text style={{ textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
      No data available for this period
    </Text>
  </View>
) : (
              <>
              <LineChart
  data={chartData}
  width={screenWidth - 32}
  height={230}
  segments={4}
  formatYLabel={(v) => `Rs.${v}`}
  withShadow={false}
  withInnerLines={true}
  withOuterLines={false}
  chartConfig={{
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,

    // 🔥 IMPORTANT: base color must exist
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,

    labelColor: () => "#6b7280",

    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffffff",
    },

    propsForBackgroundLines: {
      strokeDasharray: "6 6",
      stroke: "#e5e7eb",
    },
  }}
  bezier
  onDataPointClick={({ x, y, index }) =>
    setTooltip({ x, y, index })
  }
/>

                {tooltip && (
                  <TooltipCard
                    {...tooltip}
                    labels={chartData.labels}
                    farmerData={chartData.datasets[0].data}
                    webData={chartData.datasets[1].data}
                    onClose={() => setTooltip(null)}
                  />
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= COMPONENTS ================= */

function SummaryCard({ icon, label, value, unit, bg }: any) {
  return (
    <View
      style={{
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        {icon}
      </View>
      <Text style={{ fontSize: 12, color: "#6b7280" }}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: "#9ca3af" }}>{unit}</Text>
    </View>
  );
}

function PillButton({ text, active, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: active ? "#2563eb" : "#e5e7eb",
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: active ? "#fff" : "#374151",
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

function LegendDot({ color, label }: any) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
        }}
      />
      <Text style={{ fontSize: 12, color: "#374151" }}>{label}</Text>
    </View>
  );
}

function TooltipCard({
  x,
  y,
  index,
  labels,
  farmerData,
  webData,
  onClose,
}: any) {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onClose}
      style={{
        position: "absolute",
        left: x - 80,
        top: y - 115,
        width: 170,
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <Text style={{ fontWeight: "700", marginBottom: 6 }}>
        {labels[index]}
      </Text>
      <Text style={{ color: "#2563eb", fontSize: 12 }}>
        Farmer Price (Rs): {farmerData[index]}
      </Text>
      <Text style={{ color: "#16a34a", fontSize: 12, marginTop: 2 }}>
        Web Price (Rs): {webData[index]}
      </Text>
    </TouchableOpacity>
  );
}
