import { Leaf } from "lucide-react-native";
import React, { useState } from "react";
import useAxios from "@/hooks/useAxios";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ================= TYPES ================= */

type FormState = {
  productionQuantity: string;
  totalCost: string;
  farmerPrice: string;
  webPrice: string;
  plantDate: string;
  harvestDate: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

/* ================= MAIN ================= */

export default function AddData() {
  const initialForm: FormState = {
    productionQuantity: "",
    totalCost: "",
    farmerPrice: "",
    webPrice: "",
    plantDate: "",
    harvestDate: "",
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const axios = useAxios();

  /* ================= SAFE ALERT ================= */

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  /* ================= HELPERS ================= */

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const resetForm = () => {
    showMessage("Cleared", "All form data has been cleared.");
    setForm(initialForm);
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Errors = {};

    if (!form.productionQuantity)
      e.productionQuantity = "Please enter production quantity";

    if (!form.totalCost)
      e.totalCost = "Please enter total production cost";

    if (!form.farmerPrice)
      e.farmerPrice = "Please enter farm gate price";

    if (!form.webPrice)
      e.webPrice = "Please enter web market price";

    if (
      form.plantDate &&
      form.harvestDate &&
      form.harvestDate < form.plantDate
    ) {
      e.harvestDate = "Harvest date must be after plant date";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = async () => {
    if (!validate()) {
      showMessage(
        "Incomplete Information",
        "Please correct the highlighted fields."
      );
      return;
    }

    setLoading(true);

    const payload: any = {
      date: new Date().toISOString().split("T")[0],
      productionQuantity: parseInt(form.productionQuantity, 10) || 0,
      totalCost: parseFloat(form.totalCost) || 0,
      farmerPrice: parseFloat(form.farmerPrice) || 0,
      webPrice: parseFloat(form.webPrice) || 0,
    };

    if (form.plantDate) payload.plantDate = form.plantDate;
    if (form.harvestDate) payload.harvestDate = form.harvestDate;

    try {
      const res = await axios.post("/data/data", payload);

      const savedMsg = res.data?.message || "Production data saved successfully";
      const disaster = res.data?.naturalDisaster;

      // call prediction endpoint using the same values (model expects kg, lkr, etc)
      let priceMsg = "";
      try {
        const predictRes = await axios.post("/api/predict-price", {
          production_qty_kg: parseInt(form.productionQuantity, 10) || 0,
          total_cost_lkr: parseFloat(form.totalCost) || 0,
          web_price_lkr: parseFloat(form.webPrice) || 0,
          natural_disaster: disaster || "No disaster",
        });
        priceMsg = `\nPredicted leaf price: ${predictRes.data?.predictedPrice}`;
      } catch (pErr: any) {
        console.error("prediction error", pErr);
        priceMsg = "\n(Prediction failed)";
      }

      showMessage(
        "Success",
        `${savedMsg}\n\nDisaster Status: ${disaster || "unknown"}${priceMsg}`
      );

      setForm(initialForm);
      setErrors({});
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while saving.";

      showMessage("Failed", errMsg);
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* HEADER */}
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
          <View>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#fff" }}>
              Add Production Data
            </Text>
            <Text style={{ fontSize: 13, color: "#dcfce7" }}>
              Enter accurate farm production details
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Input
          label="Production Quantity (kg)"
          value={form.productionQuantity}
          placeholder="e.g. 1250"
          error={errors.productionQuantity}
          keyboardType="numeric"
          onChange={(v: string) => update("productionQuantity", v)}
        />

        <Input
          label="Total Production Cost (LKR)"
          value={form.totalCost}
          placeholder="e.g. 180000"
          error={errors.totalCost}
          keyboardType="numeric"
          onChange={(v: string) => update("totalCost", v)}
        />

        <Input
          label="Farm Gate Price (LKR / kg)"
          value={form.farmerPrice}
          placeholder="e.g. 210"
          error={errors.farmerPrice}
          keyboardType="numeric"
          onChange={(v: string) => update("farmerPrice", v)}
        />

        <Input
          label="Web Market Price (LKR / kg)"
          value={form.webPrice}
          placeholder="e.g. 245"
          error={errors.webPrice}
          keyboardType="numeric"
          onChange={(v: string) => update("webPrice", v)}
        />

        <Input
          label="Plant Date (YYYY-MM-DD)"
          value={form.plantDate}
          placeholder="e.g. 2024-05-01"
          error={errors.plantDate}
          onChange={(v: string) => update("plantDate", v)}
        />

        <Input
          label="Harvest Date (YYYY-MM-DD)"
          value={form.harvestDate}
          placeholder="e.g. 2024-10-01"
          error={errors.harvestDate}
          onChange={(v: string) => update("harvestDate", v)}
        />

        <View style={{ marginTop: 28, gap: 12 }}>
          <Button
            title={loading ? "Saving..." : "Save Data"}
            onPress={onSave}
            disabled={loading}
          />
          <ResetButton title="Reset / Clear Data" onPress={resetForm} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Input({
  label,
  value,
  placeholder,
  error,
  onChange,
  keyboardType = "default",
}: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontWeight: "600" }}>{label}</Text>

      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        onChangeText={onChange}
        style={{
          borderWidth: 1,
          borderColor: error ? "#dc2626" : "#e5e7eb",
          borderRadius: 14,
          padding: 14,
          marginTop: 6,
          backgroundColor: "#fff",
        }}
      />

      {error && (
        <Text style={{ color: "#dc2626", marginTop: 4 }}>{error}</Text>
      )}
    </View>
  );
}

function Button({ title, onPress, disabled }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        padding: 14,
        borderRadius: 16,
        alignItems: "center",
        backgroundColor: "#16a34a",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text style={{ fontWeight: "700", color: "#fff" }}>{title}</Text>
    </TouchableOpacity>
  );
}

function ResetButton({ title, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 14,
        borderRadius: 16,
        alignItems: "center",
        backgroundColor: "#fee2e2",
      }}
    >
      <Text style={{ fontWeight: "700", color: "#dc2626" }}>{title}</Text>
    </TouchableOpacity>
  );
}