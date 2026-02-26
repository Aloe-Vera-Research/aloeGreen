import {
  Calendar,
  CloudRain,
  Droplet,
  Leaf,
  Sun,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

/* ================= TYPES ================= */

type Disaster = "none" | "flood" | "drought" | "";

type FormState = {
  productionQuantity: string;
  totalCost: string;
  farmerPrice: string;
  webPrice: string;
  plantDate: string;
  harvestDate: string;
  naturalDisaster: Disaster;
};

type Errors = Partial<Record<keyof FormState, string>>;
type ActiveDate = "plantDate" | "harvestDate" | null;

/* ================= MAIN ================= */

export default function AddData() {
  const initialForm: FormState = {
    productionQuantity: "",
    totalCost: "",
    farmerPrice: "",
    webPrice: "",
    plantDate: "",
    harvestDate: "",
    naturalDisaster: "",
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [activeDate, setActiveDate] = useState<ActiveDate>(null);

  /* ================= HELPERS ================= */

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const resetForm = () => {
    Alert.alert(
      "Clear all data?",
      "This will remove all entered values.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setForm(initialForm);
            setErrors({});
            setActiveDate(null);
          },
        },
      ]
    );
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

    if (!form.plantDate)
      e.plantDate = "Please select plant date";

    if (!form.harvestDate)
      e.harvestDate = "Please select harvest date";

    if (
      form.plantDate &&
      form.harvestDate &&
      form.harvestDate < form.plantDate
    ) {
      e.harvestDate = "Harvest date must be after plant date";
    }

    if (!form.naturalDisaster)
      e.naturalDisaster = "Please select environmental condition";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = () => {
    if (!validate()) {
      Alert.alert(
        "Incomplete Information",
        "Please correct the highlighted fields."
      );
      return;
    }

    Alert.alert("Success", "Production data saved successfully 🌱");
    console.log(form);
  };

  /* ================= UI ================= */

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
          onChange={(v: string) => update("productionQuantity", v)}
        />

        <Input
          label="Total Production Cost (LKR)"
          value={form.totalCost}
          placeholder="e.g. 180000"
          error={errors.totalCost}
          onChange={(v: string) => update("totalCost", v)}
        />

        <Input
          label="Farm Gate Price (LKR / kg)"
          value={form.farmerPrice}
          placeholder="e.g. 210"
          error={errors.farmerPrice}
          onChange={(v: string) => update("farmerPrice", v)}
        />

        <Input
          label="Web Market Price (LKR / kg)"
          value={form.webPrice}
          placeholder="e.g. 245"
          error={errors.webPrice}
          onChange={(v: string) => update("webPrice", v)}
        />

        <DateInput
          label="Plant Date"
          value={form.plantDate}
          error={errors.plantDate}
          onPress={() => setActiveDate("plantDate")}
        />

        <DateInput
          label="Harvest Date"
          value={form.harvestDate}
          error={errors.harvestDate}
          onPress={() => setActiveDate("harvestDate")}
        />

        <Text style={{ fontWeight: "600", marginTop: 16 }}>
          Environmental Condition
        </Text>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
          <Env
            label="Normal"
            icon={<Sun color="#facc15" />}
            active={form.naturalDisaster === "none"}
            onPress={() => update("naturalDisaster", "none")}
          />
          <Env
            label="Flood"
            icon={<Droplet color="#0ea5e9" />}
            active={form.naturalDisaster === "flood"}
            onPress={() => update("naturalDisaster", "flood")}
          />
          <Env
            label="Drought"
            icon={<CloudRain color="#2563eb" />}
            active={form.naturalDisaster === "drought"}
            onPress={() => update("naturalDisaster", "drought")}
          />
        </View>

        {errors.naturalDisaster && (
          <Text style={{ color: "#dc2626", marginTop: 6 }}>
            {errors.naturalDisaster}
          </Text>
        )}

        {/* ACTION BUTTONS */}
        <View style={{ marginTop: 28, gap: 12 }}>
          <Button title="Save Data" onPress={onSave} />
          <ResetButton title="Reset / Clear Data" onPress={resetForm} />
        </View>
      </ScrollView>

      {/* DATE PICKER */}
      <DateTimePickerModal
        isVisible={activeDate !== null}
        mode="date"
        display="inline"
        themeVariant="light"
        onConfirm={(date: Date) => {
          if (activeDate) update(activeDate, formatDate(date));
          setActiveDate(null);
        }}
        onCancel={() => setActiveDate(null)}
      />
    </SafeAreaView>
  );
}

/* ================= REUSABLE ================= */

function Input({ label, value, placeholder, error, onChange }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontWeight: "600" }}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
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
      {error && <Text style={{ color: "#dc2626" }}>{error}</Text>}
    </View>
  );
}

function DateInput({ label, value, error, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: "600" }}>{label}</Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: error ? "#dc2626" : "#e5e7eb",
          borderRadius: 14,
          padding: 14,
          marginTop: 6,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: "#fff",
        }}
      >
        <Calendar size={18} color="#000" />
        <Text style={{ color: value ? "#111827" : "#94a3b8" }}>
          {value || "Select date"}
        </Text>
      </View>
      {error && <Text style={{ color: "#dc2626" }}>{error}</Text>}
    </TouchableOpacity>
  );
}

function Env({ label, icon, active, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        padding: 14,
        borderRadius: 16,
        alignItems: "center",
        backgroundColor: active ? "#dcfce7" : "#fff",
        borderWidth: 1,
        borderColor: active ? "#16a34a" : "#e5e7eb",
      }}
    >
      {icon}
      <Text style={{ marginTop: 6, fontWeight: "600" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function Button({ title, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 14,
        borderRadius: 16,
        alignItems: "center",
        backgroundColor: "#16a34a",
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
