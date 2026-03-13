import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Message = {
  text: string;
  role: "user" | "model";
  timestamp: Date;
};

const API_KEY = "AIzaSyARuVdvV5wa0ZT1HgcZlMtjZcMYQlQg6RQ";

const systemInstruction = `You are AloeVera AI, an expert in Aloe Vera farming. Help with disease detection, yield forecasting, fertilizer recommendations, and price predictions. Only answer questions about Aloe Vera farming. Respond in Sinhala if asked in Sinhala.`;

const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/##+\s*/g, "")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\n\n\n+/g, "\n\n")
    .trim();
};

const QUICK_PROMPTS = [
  { label: "Disease Detection", icon: "leaf-circle-outline", lib: "mci" as const },
  { label: "Yield Forecast", icon: "chart-timeline-variant", lib: "mci" as const },
  { label: "Fertilizer Plan", icon: "sprout-outline", lib: "mci" as const },
  { label: "Price Prediction", icon: "trending-up", lib: "ion" as const },
];

function TypingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={typing.wrap}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            typing.dot,
            {
              opacity: dot,
              transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const typing = StyleSheet.create({
  wrap: { flexDirection: "row", gap: 5, alignItems: "center", paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2E7D32" },
});

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableModel, setAvailableModel] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
    checkAvailableModels();
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  const checkAvailableModels = async () => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
      );
      const data = await response.json();
      const models = data.models || [];
      const freeModels = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
      for (const freeName of freeModels) {
        const model = models.find(
          (m: any) =>
            m.name.includes(freeName) &&
            m.supportedGenerationMethods?.includes("generateContent") &&
            !m.name.includes("exp")
        );
        if (model) { setAvailableModel(model.name.replace("models/", "")); return; }
      }
      setAvailableModel("gemini-1.5-flash");
    } catch {
      setAvailableModel("gemini-1.5-flash");
    }
  };

  const handleSend = async (text?: string) => {
    const input = text || userInput;
    if (!input.trim() || !availableModel) return;

    const newMsg: Message = { text: input, role: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);
    setUserInput("");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${availableModel}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemInstruction}\nUser: ${input}\nRespond only in plain text.` },
                ],
              },
            ],
          }),
        }
      );
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      setMessages((prev) => [
        ...prev,
        { text: cleanMarkdown(rawText), role: "model", timestamp: new Date() },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { text: `Something went wrong. Please try again.`, role: "model", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <LinearGradient colors={["#E8F5E9", "#F1F8E9", "#FFFFFF"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          {/* ── Header ── */}
          <Animated.View
            style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <View style={s.headerTop}>
              <View style={s.headerIconWrap}>
                <LinearGradient
                  colors={["#2E7D32", "#1B5E20"]}
                  style={StyleSheet.absoluteFill}
                  borderRadius={18}
                />
                <MaterialCommunityIcons name="robot-happy-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={s.headerText}>
                <Text style={s.headerTitle}>AloeGreen AI</Text>
                <Text style={s.headerSub}>Smart Aloe Vera Assistant</Text>
              </View>
              <View style={s.onlineBadge}>
                <View style={s.onlineDot} />
                <Text style={s.onlineText}>Online</Text>
              </View>
            </View>
          </Animated.View>

          {/* ── Chat Area ── */}
          <ScrollView
            ref={scrollRef}
            style={s.chatScroll}
            contentContainerStyle={s.chatContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Empty state */}
            {messages.length === 0 && (
              <Animated.View
                style={[s.emptyState, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
              >
                {/* Avatar */}
                <View style={s.botAvatar}>
                  <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={StyleSheet.absoluteFill} borderRadius={36} />
                  <MaterialCommunityIcons name="robot-happy-outline" size={36} color="#FFFFFF" />
                </View>
                <Text style={s.emptyTitle}>Hi, I'm AloeGreen AI</Text>
                <Text style={s.emptySubtitle}>
                  Your expert companion for Aloe Vera farming. Ask me anything!
                </Text>

                {/* Quick prompts */}
                <View style={s.quickGrid}>
                  {QUICK_PROMPTS.map((q) => (
                    <TouchableOpacity
                      key={q.label}
                      style={s.quickCard}
                      onPress={() => handleSend(q.label)}
                      activeOpacity={0.8}
                    >
                      <View style={s.quickIconWrap}>
                        {q.lib === "mci" ? (
                          <MaterialCommunityIcons name={q.icon as any} size={20} color="#2E7D32" />
                        ) : (
                          <Ionicons name={q.icon as any} size={20} color="#2E7D32" />
                        )}
                      </View>
                      <Text style={s.quickLabel}>{q.label}</Text>
                      <Ionicons name="chevron-forward" size={14} color="#BDBDBD" />
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <View
                key={i}
                style={[s.msgRow, msg.role === "user" ? s.msgRowUser : s.msgRowBot]}
              >
                {msg.role === "model" && (
                  <View style={s.botBubbleAvatar}>
                    <MaterialCommunityIcons name="leaf" size={14} color="#2E7D32" />
                  </View>
                )}
                <View style={{ maxWidth: "78%" }}>
                  <View
                    style={[
                      s.bubble,
                      msg.role === "user" ? s.bubbleUser : s.bubbleBot,
                    ]}
                  >
                    <Text style={[s.bubbleText, msg.role === "user" && s.bubbleTextUser]}>
                      {msg.text}
                    </Text>
                  </View>
                  <Text style={[s.timestamp, msg.role === "user" && s.timestampUser]}>
                    {formatTime(msg.timestamp)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Typing indicator */}
            {loading && (
              <View style={[s.msgRow, s.msgRowBot]}>
                <View style={s.botBubbleAvatar}>
                  <MaterialCommunityIcons name="leaf" size={14} color="#2E7D32" />
                </View>
                <View style={s.bubbleBot}>
                  <TypingDots />
                </View>
              </View>
            )}
          </ScrollView>

          {/* ── Input Bar ── */}
          <View style={s.inputBar}>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={userInput}
                onChangeText={setUserInput}
                placeholder="Ask about Aloe Vera farming…"
                placeholderTextColor="#BDBDBD"
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={() => handleSend()}
              />
            </View>
            <TouchableOpacity
              style={[s.sendBtn, (!userInput.trim() || loading) && s.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!userInput.trim() || loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  userInput.trim() && !loading
                    ? ["#2E7D32", "#1B5E20"]
                    : ["#E0E0E0", "#BDBDBD"]
                }
                style={StyleSheet.absoluteFill}
                borderRadius={22}
              />
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  // Header
  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  headerIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: "800", color: "#1B5E20", letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: "#4E6E4E", fontWeight: "500", marginTop: 2 },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#4CAF50" },
  onlineText: { fontSize: 11, fontWeight: "700", color: "#2E7D32" },

  // Chat
  chatScroll: { flex: 1 },
  chatContent: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    paddingTop: 4,
    flexGrow: 1,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 20,
  },
  botAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 7,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#4E6E4E",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  quickGrid: { width: "100%", gap: 10 },
  quickCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  quickIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  quickLabel: { flex: 1, fontSize: 14, fontWeight: "700", color: "#1B5E20" },

  // Messages
  msgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12, gap: 8 },
  msgRowUser: { justifyContent: "flex-end" },
  msgRowBot: { justifyContent: "flex-start" },
  botBubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginBottom: 16,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: "#2E7D32",
    borderBottomRightRadius: 4,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  bubbleBot: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleText: { fontSize: 15, color: "#1B5E20", lineHeight: 21 },
  bubbleTextUser: { color: "#FFFFFF" },
  timestamp: {
    fontSize: 10,
    color: "#BDBDBD",
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 4,
  },
  timestampUser: { textAlign: "right", marginRight: 4, marginLeft: 0 },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: "#F5F9F5",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    minHeight: 44,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
    color: "#1B5E20",
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
});