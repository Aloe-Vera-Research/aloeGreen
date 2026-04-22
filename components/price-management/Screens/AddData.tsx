import { Leaf } from "lucide-react-native";
import React, { useState } from "react";
import useAxios from "@/hooks/useAxios";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Modal,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useLanguage } from "@/context/LanguageContext";

type FormState = {
  productionQuantity: string;
  totalCost: string;
  farmerPrice: string;
  webPrice: string;
  plantDate: string;
  harvestDate: string;
};

export default function AddData() {
  const axios = useAxios();
  const { t } = useLanguage();

  const initialForm: FormState = {
    productionQuantity: "",
    totalCost: "",
    farmerPrice: "",
    webPrice: "",
    plantDate: "",
    harvestDate: "",
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState<any>(null);

  const getLocation = async () => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();

      if (!enabled) {
        Alert.alert(t("locationDisabled"), t("pleaseEnableLocationServices"));
        return null;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(t("permissionDenied"), t("locationPermissionRequired"));
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});

      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      const geo = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });

      let locationName = t("unknown");

      if (geo.length > 0) {
        const place = geo[0];

        const name =
          place.city ||
          place.subregion ||
          place.region ||
          t("unknown");

        locationName = `${name}, ${place.country}`;
      }

      return {
        lat,
        lon,
        locationName,
      };
    } catch (err) {
      console.log(err);
      Alert.alert(t("error"), t("failedToGetLocation"));
      return null;
    }
  };

  const clearData = () => {
    Alert.alert(
      t("clearData"),
      t("clearAllFieldsConfirm"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("clear"),
          style: "destructive",
          onPress: () => {
            setForm(initialForm);
            setResult(null);
          },
        },
      ]
    );
  };

  const onSave = async () => {
    if (
      !form.productionQuantity ||
      !form.totalCost ||
      !form.farmerPrice ||
      !form.webPrice
    ) {
      Alert.alert(t("missingData"), t("pleaseFillRequiredFields"));
      return;
    }

    setLoading(true);

    const locationData: any = await getLocation();

    if (!locationData) {
      setLoading(false);
      return;
    }

    const lat = locationData.lat;
    const lon = locationData.lon;
    const locationName = locationData.locationName;

    const payload: any = {
      date: new Date().toISOString().split("T")[0],
      productionQuantity: Number(form.productionQuantity),
      totalCost: Number(form.totalCost),
      farmerPrice: Number(form.farmerPrice),
      webPrice: Number(form.webPrice),
      latitude: lat,
      longitude: lon,
    };

    if (form.plantDate) payload.plantDate = form.plantDate;
    if (form.harvestDate) payload.harvestDate = form.harvestDate;

    try {
      const predictRes = await axios.post("/api/predict-price", {
        production_qty_kg: payload.productionQuantity,
        total_cost_lkr: payload.totalCost,
        web_price_lkr: payload.webPrice,
        natural_disaster: "No disaster",
      });

      const predictedPrice = predictRes.data?.predictedPrice || 0;

      const res = await axios.post("/data/data", {
        ...payload,
        predictedPrice,
      });

      setResult({
        predictedPrice,
        disaster: res.data?.naturalDisaster,
        advice: res.data?.advice,
        location: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        locationName,
        plantDate: form.plantDate,
        harvestDate: form.harvestDate,
      });

      setModalVisible(true);
      setForm(initialForm);
    } catch (err: any) {
      console.log(err?.response?.data);
      Alert.alert(t("error"), t("failedToSaveData"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View
        style={{
          backgroundColor: "#16a34a",
          padding: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Leaf size={26} color="#fff" />
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#fff" }}>
            {t("addProductionData")}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Input
            label={t("productionQuantityKg")}
            placeholder={t("example1500")}
            value={form.productionQuantity}
            onChange={(v: string) =>
              setForm({ ...form, productionQuantity: v })
            }
          />

          <Input
            label={t("totalCostLkr")}
            placeholder={t("example100000")}
            value={form.totalCost}
            onChange={(v: string) =>
              setForm({ ...form, totalCost: v })
            }
          />

          <Input
            label={t("farmGatePriceLkr")}
            placeholder={t("example210")}
            value={form.farmerPrice}
            onChange={(v: string) =>
              setForm({ ...form, farmerPrice: v })
            }
          />

          <Input
            label={t("webMarketPriceLkr")}
            placeholder={t("example230")}
            value={form.webPrice}
            onChange={(v: string) =>
              setForm({ ...form, webPrice: v })
            }
          />

          <Input
            label={t("plantDate")}
            placeholder={t("datePlaceholder")}
            value={form.plantDate}
            onChange={(v: string) =>
              setForm({ ...form, plantDate: v })
            }
          />

          <Input
            label={t("harvestDate")}
            placeholder={t("datePlaceholder")}
            value={form.harvestDate}
            onChange={(v: string) =>
              setForm({ ...form, harvestDate: v })
            }
          />

          <Button
            title={loading ? t("saving") : t("saveData")}
            onPress={onSave}
            disabled={loading}
          />

          <View style={{ height: 10 }} />

          <TouchableOpacity
            onPress={clearData}
            style={{
              backgroundColor: "#ef4444",
              padding: 14,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {t("clearData")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "700" }}>
              🌱 {t("productionDataSaved")}
            </Text>

            {result && (
              <View style={{ marginTop: 12, gap: 4 }}>
                <Text>{t("predictedPrice")} - Rs. {result.predictedPrice.toFixed(2)}</Text>
                <Text>{t("disasterStatus")} - {result.disaster}</Text>
                <Text>{t("advice")} - {result.advice}</Text>
                <Text>{t("locationUsed")} - {result.location}</Text>
                <Text>{t("locationName")} - {result.locationName}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                backgroundColor: "#16a34a",
                padding: 12,
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                {t("close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Input({ label, value, onChange, placeholder }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text>{label}</Text>

      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        onChangeText={onChange}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 12,
          marginTop: 5,
        }}
      />
    </View>
  );
}

function Button({ title, onPress, disabled }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: "#16a34a",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700" }}>{title}</Text>
    </TouchableOpacity>
  );
}