import {
  AlertTriangle,
  Calendar,
  Globe,
  Leaf,
  Package,
  ShoppingCart,
  Sprout,
  Wallet,
  TrendingUp,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useAxios from "@/hooks/useAxios";
import { useLanguage } from "@/context/LanguageContext";

type Record = {
  id: string;
  date: string;
  productionQuantity: number;
  totalCost: number;
  farmerPrice: number;
  webPrice: number;
  plantDate?: string;
  harvestDate?: string;
  naturalDisaster: string;
  predictedPrice?: number;
  createdAt?: string;
};

export default function DataRecords() {
  const axios = useAxios();
  const { t } = useLanguage();

  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/data/data");
      const recordList: Record[] = res.data?.records || [];
      setRecords(recordList);
      if (recordList.length > 0) {
        setSelectedRecord(recordList[0]);
      }
    } catch (err) {
      console.error("Failed to fetch records", err);
    } finally {
      setLoading(false);
    }
  }, [axios]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [fetchRecords])
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 10, color: "#666" }}>{t("loadingRecords")}</Text>
      </SafeAreaView>
    );
  }

  if (!selectedRecord) {
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Leaf size={28} color="#ffffff" />
            <View>
              <Text style={{ fontSize: 22, fontWeight: "700", color: "#ffffff" }}>
                {t("productionRecords")}
              </Text>
              <Text style={{ fontSize: 13, color: "#dcfce7", marginTop: 2 }}>
                {t("noRecordsFound")}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const farmData = selectedRecord;
  const farmRevenue = farmData.productionQuantity * farmData.farmerPrice;
  const webRevenue = farmData.productionQuantity * farmData.webPrice;
  const netProfit = farmRevenue - farmData.totalCost;
  const rs = (v: number) => `Rs. ${v.toLocaleString()}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
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
            <Leaf size={28} color="#ffffff" />
            <View>
              <Text style={{ fontSize: 22, fontWeight: "700", color: "#ffffff" }}>
                {t("productionRecords")}
              </Text>
              <Text style={{ fontSize: 13, color: "#dcfce7", marginTop: 2 }}>
                {t("showingLatest")} {records.length > 0 ? `(${records.length} ${t("total")})` : ""}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setShowSelector(!showSelector)}
            style={{
              backgroundColor: "#fff",
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
              📅 {selectedRecord.date || t("noDate")}
            </Text>
            <Text style={{ color: "#999" }}>{showSelector ? "▼" : "▶"}</Text>
          </TouchableOpacity>

          {showSelector && records.length > 1 && (
            <View
              style={{
                maxHeight: 200,
                marginTop: 6,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                backgroundColor: "#fff",
                overflow: "hidden",
              }}
            >
              <FlatList
                data={records}
                keyExtractor={(item) => item.id}
                scrollEnabled
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setSelectedRecord(item);
                      setShowSelector(false);
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: "#f0f0f0",
                      backgroundColor: item.id === selectedRecord.id ? "#f0fdf4" : "#fff",
                    }}
                  >
                    <Text style={{ fontSize: 13, color: "#111827", fontWeight: "600" }}>
                      {item.date} - {item.productionQuantity} kg
                    </Text>
                    <Text style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                      {item.naturalDisaster}
                      {item.predictedPrice && ` • ${t("pred")} Rs. ${item.predictedPrice}`}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Section title={t("productionDetails")}>
            <RecordItem
              icon={<Package size={18} color="#15803d" />}
              bg="#dcfce7"
              label={t("productionQuantity")}
              value={`${farmData.productionQuantity} kg`}
            />

            <RecordItem
              icon={<Wallet size={18} color="#b45309" />}
              bg="#fef3c7"
              label={t("totalProductionCost")}
              value={rs(farmData.totalCost)}
            />
          </Section>

          <Section title={t("marketPrices")}>
            <RecordItem
              icon={<ShoppingCart size={18} color="#1d4ed8" />}
              bg="#dbeafe"
              label={t("farmGatePrice")}
              value={`${rs(farmData.farmerPrice)} / kg`}
            />

            <RecordItem
              icon={<Globe size={18} color="#047857" />}
              bg="#d1fae5"
              label={t("onlineMarketPrice")}
              value={`${rs(farmData.webPrice)} / kg`}
            />
          </Section>

          <Section title={t("cropTimeline")}>
            {farmData.plantDate && (
              <RecordItem
                icon={<Sprout size={18} color="#6d28d9" />}
                bg="#f5f3ff"
                label={t("plantDate")}
                value={farmData.plantDate}
              />
            )}

            {farmData.harvestDate && (
              <RecordItem
                icon={<Calendar size={18} color="#b45309" />}
                bg="#fef3c7"
                label={t("harvestDate")}
                value={farmData.harvestDate}
              />
            )}
          </Section>

          <Section title={t("environmentalCondition")}>
            <RecordItem
              icon={<AlertTriangle size={18} color="#dc2626" />}
              bg="#fee2e2"
              label={t("naturalDisaster")}
              value={farmData.naturalDisaster}
            />
          </Section>

          {farmData.predictedPrice && (
            <Section title={t("aiModelPrediction")}>
              <RecordItem
                icon={<TrendingUp size={18} color="#059669" />}
                bg="#d1fae5"
                label={t("predictedLeafPrice")}
                value={`Rs. ${farmData.predictedPrice.toLocaleString()}`}
              />
            </Section>
          )}

          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 22,
              padding: 18,
              marginTop: 20,
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
              {t("financialSummary")}
            </Text>

            <SummaryRow
              label={t("farmRevenue")}
              value={rs(farmRevenue)}
              color="#1d4ed8"
            />

            <SummaryRow
              label={t("potentialWebRevenue")}
              value={rs(webRevenue)}
              color="#047857"
            />

            <View
              style={{
                height: 1,
                backgroundColor: "#e5e7eb",
                marginVertical: 12,
              }}
            />

            <SummaryRow
              label={t("netProfit")}
              value={rs(netProfit)}
              color={netProfit >= 0 ? "#15803d" : "#dc2626"}
              bold
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "700",
          color: "#111827",
          marginBottom: 10,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function RecordItem({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 18,
        marginBottom: 12,
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
          marginRight: 14,
        }}
      >
        {icon}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: "#6b7280" }}>{label}</Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#111827",
            marginTop: 2,
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  color,
  bold = false,
}: {
  label: string;
  value: string;
  color: string;
  bold?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <Text style={{ fontSize: 14, color: "#6b7280" }}>{label}</Text>
      <Text
        style={{
          fontSize: bold ? 20 : 16,
          fontWeight: bold ? "700" : "600",
          color,
        }}
      >
        {value}
      </Text>
    </View>
  );
}