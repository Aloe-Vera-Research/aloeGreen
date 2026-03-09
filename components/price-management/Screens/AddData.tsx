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

  /* ---------- GET LOCATION ---------- */

  const getLocation = async () => {
    try {

      const enabled = await Location.hasServicesEnabledAsync();

      if (!enabled) {
        Alert.alert("Location Disabled", "Please enable location services.");
        return null;
      }

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});

      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      const geo = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });

      let locationName = "Unknown";

      if (geo.length > 0) {

        const place = geo[0];

        const name =
          place.city ||
          place.subregion ||
          place.region ||
          "Unknown";

        locationName = `${name}, ${place.country}`;
      }

      return {
        lat,
        lon,
        locationName
      };

    } catch (err) {

      console.log(err);
      Alert.alert("Error", "Failed to get location.");
      return null;

    }
  };

  /* ---------- CLEAR DATA ---------- */

  const clearData = () => {

    Alert.alert(
      "Clear Data",
      "Are you sure you want to clear all fields?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setForm(initialForm);
            setResult(null);
          }
        }
      ]
    );

  };

  /* ---------- SAVE DATA ---------- */

  const onSave = async () => {

    if (
      !form.productionQuantity ||
      !form.totalCost ||
      !form.farmerPrice ||
      !form.webPrice
    ) {
      Alert.alert("Missing Data", "Please fill all required fields.");
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
      longitude: lon
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
      Alert.alert("Error", "Failed to save data.");

    } finally {

      setLoading(false);

    }
  };

  /* ---------- UI ---------- */

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
            Add Production Data
          </Text>
        </View>

      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >

        <ScrollView contentContainerStyle={{ padding: 16 }}>

          <Input
            label="Production Quantity (kg)"
            placeholder="Example: 1500"
            value={form.productionQuantity}
            onChange={(v: string) =>
              setForm({ ...form, productionQuantity: v })
            }
          />

          <Input
            label="Total Cost (LKR)"
            placeholder="Example: 100000"
            value={form.totalCost}
            onChange={(v: string) =>
              setForm({ ...form, totalCost: v })
            }
          />

          <Input
            label="Farm Gate Price (LKR)"
            placeholder="Example: 210"
            value={form.farmerPrice}
            onChange={(v: string) =>
              setForm({ ...form, farmerPrice: v })
            }
          />

          <Input
            label="Web Market Price (LKR)"
            placeholder="Example: 230"
            value={form.webPrice}
            onChange={(v: string) =>
              setForm({ ...form, webPrice: v })
            }
          />

          <Input
            label="Plant Date"
            placeholder="YYYY-MM-DD"
            value={form.plantDate}
            onChange={(v: string) =>
              setForm({ ...form, plantDate: v })
            }
          />

          <Input
            label="Harvest Date"
            placeholder="YYYY-MM-DD"
            value={form.harvestDate}
            onChange={(v: string) =>
              setForm({ ...form, harvestDate: v })
            }
          />

          {/* SAVE BUTTON */}

          <Button
            title={loading ? "Saving..." : "Save Data"}
            onPress={onSave}
            disabled={loading}
          />

          <View style={{ height: 10 }} />

          {/* CLEAR BUTTON */}

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
              Clear Data
            </Text>
          </TouchableOpacity>

        </ScrollView>

      </KeyboardAvoidingView>

      {/* RESULT MODAL */}

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
              🌱 Production Data Saved
            </Text>

            {result && (
              <View style={{ marginTop: 12 }}>
                <Text>Predicted Price - Rs. {result.predictedPrice.toFixed(2)}</Text>
                <Text>Disaster Status - {result.disaster}</Text>
                <Text>Advice - {result.advice}</Text>
                <Text>Location Used - {result.location}</Text>
                <Text>Location Name - {result.locationName}</Text>
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
                Close
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
}

/* ---------- INPUT ---------- */

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

/* ---------- BUTTON ---------- */

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