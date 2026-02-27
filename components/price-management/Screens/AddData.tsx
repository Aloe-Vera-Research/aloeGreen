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

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalPredictedPrice, setModalPredictedPrice] = useState<number | null>(null);
  const [modalDisaster, setModalDisaster] = useState("");

  /* ================= SAFE ALERT ================= */

  const showModal = (
    type: "success" | "error",
    title: string,
    message: string,
    predictedPrice?: number,
    disaster?: string
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalPredictedPrice(predictedPrice || null);
    setModalDisaster(disaster || "");
    setModalVisible(true);
  };

  /* ================= HELPERS ================= */

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    showModal("success", "✅ Cleared", "All form data has been cleared.");
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
      showModal(
        "error",
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
      let predictedPrice = 0;
      let disaster = "";

      // First, call prediction endpoint
      try {
        const predictRes = await axios.post("/api/predict-price", {
          production_qty_kg: parseInt(form.productionQuantity, 10) || 0,
          total_cost_lkr: parseFloat(form.totalCost) || 0,
          web_price_lkr: parseFloat(form.webPrice) || 0,
          natural_disaster: "No disaster",
        });
        predictedPrice = predictRes.data?.predictedPrice || 0;
      } catch (pErr: any) {
        console.error("prediction error", pErr);
        predictedPrice = 0;
      }

      // Add predicted price to payload
      if (predictedPrice > 0) {
        payload.predictedPrice = predictedPrice;
      }

      // Then save data with predicted price
      const res = await axios.post("/data/data", payload);
      disaster = res.data?.naturalDisaster || "No disaster";

      showModal(
        "success",
        "✅ Success",
        res.data?.message || "Production data saved successfully",
        predictedPrice,
        disaster
      );

      setForm(initialForm);
      setErrors({});
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while saving.";

      showModal("error", "❌ Failed", errMsg);
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

      {/* CUSTOM SUCCESS/ERROR MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 24,
              width: "100%",
              maxWidth: 380,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            {/* Icon & Title */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 32, marginBottom: 10 }}>
                {modalType === "success" ? "✅" : "❌"}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: modalType === "success" ? "#16a34a" : "#dc2626",
                }}
              >
                {modalTitle}
              </Text>
            </View>

            {/* Message */}
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                marginBottom: 16,
                lineHeight: 20,
              }}
            >
              {modalMessage}
            </Text>

            {/* Predicted Price Card (Success Only) */}
            {modalType === "success" && modalPredictedPrice !== null && (
              <View
                style={{
                  backgroundColor: "#f0fdf4",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: "#16a34a",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 6,
                  }}
                >
                  Predicted Leaf Price
                </Text>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: "#16a34a",
                  }}
                >
                  Rs. {modalPredictedPrice.toLocaleString()}
                </Text>
              </View>
            )}

            {/* Disaster Status (Success Only) */}
            {modalType === "success" && modalDisaster && (
              <View
                style={{
                  backgroundColor: "#fef3c7",
                  borderRadius: 16,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#92400e",
                  }}
                >
                  Disaster Status: <Text style={{ fontWeight: "700" }}>{modalDisaster}</Text>
                </Text>
              </View>
            )}

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: modalType === "success" ? "#16a34a" : "#dc2626",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: "#fff",
                  fontSize: 16,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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