import React, { useState, useEffect } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Message Type
type Message = {
    text: string;
    role: "user" | "model";
};

// API Key
const API_KEY = "AIzaSyARuVdvV5wa0ZT1HgcZlMtjZcMYQlQg6RQ";

const systemInstruction = `You are AloeVera AI, an expert in Aloe Vera farming. Help with disease detection, yield forecasting, fertilizer recommendations, and price predictions. Only answer questions about Aloe Vera farming. Respond in Sinhala if asked in Sinhala.`;

// Remove Markdown for clean UI
const cleanMarkdown = (text: string): string => {
    return text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/##+\s*/g, "")
        .replace(/`(.*?)`/g, "$1")
        .replace(/\n\n\n+/g, "\n\n")
        .trim();
};

export default function ChatbotScreen() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [availableModel, setAvailableModel] = useState<string | null>(null);

    useEffect(() => {
        checkAvailableModels();
    }, []);

    const checkAvailableModels = async () => {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
            );
            const data = await response.json();

            const models = data.models || [];
            const freeModels = [
                "gemini-1.5-flash",
                "gemini-1.5-flash-latest",
                "gemini-pro",
            ];

            for (const freeName of freeModels) {
                const model = models.find(
                    (m: any) =>
                        m.name.includes(freeName) &&
                        m.supportedGenerationMethods?.includes("generateContent") &&
                        !m.name.includes("exp")
                );
                if (model) {
                    setAvailableModel(model.name.replace("models/", ""));
                    return;
                }
            }

            setAvailableModel("gemini-1.5-flash");
        } catch {
            setAvailableModel("gemini-1.5-flash");
        }
    };

    const handleMessageSend = async () => {
        if (!userInput.trim()) return;
        if (!availableModel) return;

        const newUserMessage = { text: userInput, role: "user" as const };
        setMessages((prev) => [...prev, newUserMessage]);
        setLoading(true);

        const currentInput = userInput;
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
                                    {
                                        text: `${systemInstruction}\nUser: ${currentInput}\nRespond only in plain text.`,
                                    },
                                ],
                            },
                        ],
                    }),
                }
            );

            const data = await response.json();
            const rawText =
                data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
            const cleanedText = cleanMarkdown(rawText);

            setMessages((prev) => [...prev, { text: cleanedText, role: "model" }]);
        } catch (error: any) {
            setMessages((prev) => [
                ...prev,
                { text: `Error: ${error.message}`, role: "model" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#2E7D32" }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>AloeGreen AI Assistant</Text>
                        <Text style={styles.subtitle}>
                            Smart Support for Aloe Vera Farmers
                        </Text>
                    </View>

                    {/* Empty Chat Start Screen */}
                    {messages.length === 0 && (
                        <View style={styles.imageContainer}>
                            <Image
                                source={require("../../assets/images/chatbot.png")}
                                style={styles.chatbotImage}
                            />
                            <Text style={styles.welcomeText}>Ask me about:</Text>
                            <Text style={styles.featureText}>• Disease Detection</Text>
                            <Text style={styles.featureText}>• Yield Forecasting</Text>
                            <Text style={styles.featureText}>• Fertilizers</Text>
                            <Text style={styles.featureText}>• Price Predictions</Text>
                        </View>
                    )}

                    {/* Chat */}
                    <ScrollView
                        style={styles.chatContainer}
                        keyboardShouldPersistTaps="handled"
                    >
                        {messages.map((msg, index) => (
                            <View
                                key={index}
                                style={msg.role === "user" ? styles.userMessage : styles.botMessage}
                            >
                                <Text style={styles.messageText}>{msg.text}</Text>
                            </View>
                        ))}
                        {loading && (
                            <ActivityIndicator
                                size="large"
                                color="#2E7D32"
                                style={styles.spinner}
                            />
                        )}
                    </ScrollView>

                    {/* Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={userInput}
                            onChangeText={setUserInput}
                            placeholder="Ask about Aloe Vera farming..."
                            placeholderTextColor="#999"
                        />
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleMessageSend}
                        >
                            <Ionicons name="send" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f9f5" },
    headerContainer: {
        backgroundColor: "#2E7D32",
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        marginBottom: 10,
    },
    header: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 13,
        color: "#d0e8d0",
        textAlign: "center",
        marginTop: 4,
    },
    chatContainer: {
        flex: 1,
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    inputContainer: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderColor: "#ddd",
        alignItems: "center",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#fff",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 18,
        fontSize: 15,
    },
    sendButton: {
        marginLeft: 8,
        backgroundColor: "#2E7D32",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#2E7D32",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#c8e6c9",
        padding: 10,
        borderRadius: 16,
        marginVertical: 6,
        maxWidth: "80%",
    },
    botMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#e8f5e9",
        padding: 10,
        borderRadius: 16,
        marginVertical: 6,
        maxWidth: "80%",
    },
    messageText: { fontSize: 15, color: "#1b5e20" },
    spinner: { marginTop: 10 },
    imageContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 30,
    },
    chatbotImage: {
        width: 160,
        height: 160,
        resizeMode: "contain",
        marginBottom: 16,
    },
    welcomeText: {
        fontSize: 17,
        fontWeight: "600",
        color: "#2E7D32",
        marginBottom: 6,
    },
    featureText: {
        fontSize: 14,
        color: "#555",
        marginVertical: 2,
    },
});
