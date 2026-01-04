import { LinearGradient } from "expo-linear-gradient";
import {
  Leaf,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

export default function PriceProfit() {
  /* ---------------- DATA ---------------- */
  const totalProduction = 1250;
  const farmerPrice = 210;
  const webPrice = 245;
  const totalCost = 180000;

  const farmerRevenue = farmerPrice * totalProduction;
  const webRevenue = webPrice * totalProduction;

  const farmerProfit = farmerRevenue - totalCost;
  const webProfit = webRevenue - totalCost;

  const rs = (v: number) => `Rs. ${v.toLocaleString()}`;

  const chartData = {
    labels: ["Farm Gate", "Web Market"],
    datasets: [
      {
        data: [farmerPrice, webPrice],
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
        <LinearGradient
          colors={["#16a34a", "#15803d"]}
          style={{
            paddingHorizontal: 20,
            paddingTop: 28,
            paddingBottom: 36,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Leaf size={28} color="#ffffff" />
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#ffffff" }}>
              Price & Profit Analysis
            </Text>
          </View>
          <Text
            style={{
              marginTop: 6,
              marginLeft: 38,
              fontSize: 13,
              color: "#dcfce7",
            }}
          >
            Compare earnings and analyze profitability
          </Text>
        </LinearGradient>

        {/* ================= PRICE COMPARISON ================= */}
        <View style={{ paddingHorizontal: 16, marginTop: -20 }}>
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 22,
              padding: 18,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 12,
              }}
            >
              Price Comparison (Rs / kg)
            </Text>

            <BarChart
              data={chartData}
              width={screenWidth - 64}
              height={240}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel="Rs."
              yAxisSuffix=""
              chartConfig={{
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: () => "#16a34a",
                labelColor: () => "#6b7280",
                propsForBackgroundLines: {
                  strokeDasharray: "6 6",
                  stroke: "#e5e7eb",
                },
              }}
              style={{ borderRadius: 16 }}
            />
          </View>
        </View>

        {/* ================= FARM GATE PROFIT ================= */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <LinearGradient
            colors={["#16a34a", "#15803d"]}
            style={{
              borderRadius: 22,
              padding: 20,
            }}
          >
            <ProfitCard
              title="Estimated Profit (Farm Gate)"
              profit={farmerProfit}
              formula={`(${rs(farmerPrice)} × ${totalProduction} kg) − ${rs(
                totalCost
              )}`}
              positiveColor="#ffffff"
            />
          </LinearGradient>
        </View>

        {/* ================= WEB MARKET PROFIT ================= */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <LinearGradient
            colors={["#059669", "#047857"]}
            style={{
              borderRadius: 22,
              padding: 20,
            }}
          >
            <ProfitCard
              title="Estimated Profit (Web Market)"
              profit={webProfit}
              formula={`(${rs(webPrice)} × ${totalProduction} kg) − ${rs(
                totalCost
              )}`}
              positiveColor="#ffffff"
            />
          </LinearGradient>
        </View>

        {/* ================= PROFIT DIFFERENCE ================= */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 22,
              padding: 18,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.07,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 12,
              }}
            >
              Profit Difference
            </Text>

            <View
              style={{
                backgroundColor: "#f0fdf4",
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, color: "#6b7280" }}>
                Extra profit by selling online
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: "#16a34a",
                }}
              >
                {rs(webProfit - farmerProfit)}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginTop: 10,
                lineHeight: 16,
              }}
            >
              This shows how much more profit you can earn by selling aloe vera
              through online markets instead of local buyers.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= COMPONENTS ================= */

function ProfitCard({
  title,
  profit,
  formula,
  positiveColor,
}: {
  title: string;
  profit: number;
  formula: string;
  positiveColor: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: "#dcfce7" }}>{title}</Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: positiveColor,
            marginVertical: 6,
          }}
        >
          Rs. {profit.toLocaleString()}
        </Text>
        <Text style={{ fontSize: 12, color: "#dcfce7" }}>{formula}</Text>
      </View>

      {profit >= 0 ? (
        <TrendingUp size={30} color="#ffffff" />
      ) : (
        <TrendingDown size={30} color="#fecaca" />
      )}
    </View>
  );
}
