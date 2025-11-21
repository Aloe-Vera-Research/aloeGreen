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
import { Ionicons } from "@expo/vector-icons";

// Define the message type
type Message = {
    text: string;
    role: "user" | "model";
};

// Your new API key
const API_KEY = "";

const systemInstruction = `You are AloeVera AI, an expert in Aloe Vera farming. Help with disease detection, yield forecasting, fertilizer recommendations, and price predictions. Only answer questions about Aloe Vera farming. Respond in Sinhala if asked in Sinhala.`;

// Function to clean markdown formatting
const cleanMarkdown = (text: string): string => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')  
        .replace(/\*(.*?)\*/g, '$1')      
        .replace(/##\s*/g, '')            
        .replace(/###\s*/g, '')           
        .replace(/####\s*/g, '')          
        .replace(/`(.*?)`/g, '$1')        
        .replace(/\n\n\n+/g, '\n\n')     
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
            
            if (data.models && data.models.length > 0) {
                // Prioritize free tier models, avoid experimental ones
                const freeModels = [
                    'gemini-1.5-flash',
                    'gemini-1.5-flash-latest',
                    'gemini-1.5-flash-001',
                    'gemini-1.5-flash-002',
                    'gemini-pro'
                ];

                for (const freeName of freeModels) {
                    const model = data.models.find((m: any) => 
                        m.name.includes(freeName) && 
                        m.supportedGenerationMethods?.includes('generateContent') &&
                        !m.name.includes('exp') // Skip experimental models
                    );
                    
                    if (model) {
                        const modelName = model.name.replace('models/', '');
                        setAvailableModel(modelName);
                        console.log("Using model:", modelName);
                        return;
                    }
                }

                // Fallback to any non-experimental model
                const model = data.models.find((m: any) => 
                    m.supportedGenerationMethods?.includes('generateContent') &&
                    !m.name.includes('exp') &&
                    !m.name.includes('pro-exp')
                );
                
                if (model) {
                    const modelName = model.name.replace('models/', '');
                    setAvailableModel(modelName);
                    console.log("Using fallback model:", modelName);
                }
            }
        } catch (error) {
            console.error("Error checking models:", error);
            // Set a default model if check fails
            setAvailableModel('gemini-1.5-flash');
        }
    };

    const handleMessageSend = async () => {
        if (userInput.trim() === "") return;

        if (!availableModel) {
            setMessages((prev) => [...prev, {
                text: "Loading AI model... Please wait and try again.",
                role: "model"
            }]);
            return;
        }

        const newUserMessage = { text: userInput, role: "user" as const };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        setLoading(true);
        const currentInput = userInput;
        setUserInput("");

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${availableModel}:generateContent?key=${API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `${systemInstruction}\n\nUser: ${currentInput}\n\nPlease respond in plain text without any markdown formatting like **, ##, or *.`
                            }]
                        }]
                    }),
                }
            );

            const data = await response.json();
            
            if (!response.ok) {
                console.error("API Error:", data);
                
                // Handle quota errors specifically
                if (data.error?.message?.includes('quota')) {
                    throw new Error("Free tier limit reached. Please wait a moment and try again, or create a new API key.");
                }
                
                throw new Error(data.error?.message || `HTTP ${response.status}`);
            }

            const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
            const botResponse = cleanMarkdown(rawResponse); // Clean the markdown

            setMessages((prevMessages) => [
                ...prevMessages,
                { text: botResponse, role: "model" },
            ]);
        } catch (error: any) {
            console.error("Error during chat:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { 
                    text: `${error.message}`, 
                    role: "model" 
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.header}>AloeGreen AI Assistant</Text>
                    <Text style={styles.subtitle}>Smart Support for Aloe Vera Farmers</Text>
                </View>

                {messages.length === 0 && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={require("../../assets/images/chatbot.png")}
                            style={styles.chatbotImage}
                        />
                        <Text style={styles.welcomeText}>Ask me about:</Text>
                        <Text style={styles.featureText}>• Disease Detection & Treatment</Text>
                        <Text style={styles.featureText}>• Yield Forecasting</Text>
                        <Text style={styles.featureText}>• Fertilizer Recommendations</Text>
                        <Text style={styles.featureText}>• Price Predictions</Text>
                    </View>
                )}

                <ScrollView
                    style={styles.chatContainer}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {messages.map((message, index) => (
                        <View
                            key={index}
                            style={
                                message.role === "user"
                                    ? styles.userMessage
                                    : styles.botMessage
                            }
                        >
                            <Text style={styles.messageText}>{message.text}</Text>
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

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={userInput}
                        onChangeText={setUserInput}
                        placeholder="Ask about Aloe Vera farming..."
                        placeholderTextColor="#aaa"
                    />

                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleMessageSend}
                    >
                        <Ionicons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f9f5",
    },
    headerContainer: {
        backgroundColor: "#2E7D32",
        paddingVertical: 25,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,    
        marginBottom: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#d0e8d0",
        textAlign: "center",
        marginTop: 5,
    },
    imageContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 30,
    },
    chatbotImage: {
        width: 200,
        height: 200,
        resizeMode: "contain",
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2E7D32",
        marginBottom: 10,
    },
    featureText: {
        fontSize: 14,
        color: "#555",
        marginVertical: 2,
    },
    chatContainer: {
        flex: 1,
        paddingHorizontal: 15,
    },
    inputContainer: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: "#f5f9f5",
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 20,
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2E7D32",
        width: 50,
        height: 50,
        borderRadius: 25,
        elevation: 3,
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#c8e6c9",
        padding: 12,
        borderRadius: 15,
        marginBottom: 10,
        maxWidth: "80%",
    },
    botMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#e8f5e9",
        padding: 12,
        borderRadius: 15,
        marginBottom: 10,
        maxWidth: "80%",
    },
    messageText: {
        fontSize: 16,
        color: "#1b5e20",
    },
    spinner: {
        marginTop: 10,
    },
});