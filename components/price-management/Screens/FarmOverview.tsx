import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Globe,
  Leaf,
  Package,
  ShoppingCart,
  Wallet,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

export default function FarmOverview() {
  const router = useRouter();

  const [period, setPeriod] = useState<"7days" | "30days">("7days");
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);

  /* ---------------- DATA ---------------- */
  const totalProduction = 1250;
  const farmerPrice = 210;
  const webPrice = 245;
  const totalCost = 180000;

  const rs = (v: number) => `Rs. ${v.toLocaleString()}`;

  const chartData7Days = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
    datasets: [
      {
        data: [205, 208, 207, 210, 209, 211, 210],
        color: () => "#2563eb",
        strokeWidth: 3,
      },
      {
        data: [240, 243, 242, 245, 244, 246, 245],
        color: () => "#16a34a",
        strokeWidth: 3,
      },
    ],
  };

  const chartData30Days = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        data: [200, 205, 208, 210],
        color: () => "#2563eb",
        strokeWidth: 3,
      },
      {
        data: [235, 240, 243, 245],
        color: () => "#16a34a",
        strokeWidth: 3,
      },
    ],
  };

  const chartData = period === "7days" ? chartData7Days : chartData30Days;

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
            value={`${totalProduction}`}
            unit="kg"
            bg="#f0fdf4"
          />
          <SummaryCard
            icon={<ShoppingCart size={18} color="#2563eb" />}
            label="Farm Gate Price"
            value={rs(farmerPrice)}
            unit="/ kg"
            bg="#eff6ff"
          />
          <SummaryCard
            icon={<Globe size={18} color="#059669" />}
            label="Web Market Price"
            value={rs(webPrice)}
            unit="/ kg"
            bg="#ecfdf5"
          />
          <SummaryCard
            icon={<Wallet size={18} color="#92400e" />}
            label="Production Cost"
            value={rs(totalCost)}
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

          <View style={{ flexDirection: "row", gap: 8 }}>
            <PillButton
              text="7 Days"
              active={period === "7days"}
              onPress={() => setPeriod("7days")}
            />
            <PillButton
              text="30 Days"
              active={period === "30days"}
              onPress={() => setPeriod("30days")}
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
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={230}
              segments={4}
              formatYLabel={(v) => `Rs.${v}`}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: () => "#9ca3af",
                labelColor: () => "#6b7280",
                propsForDots: {
                  r: "4",
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
