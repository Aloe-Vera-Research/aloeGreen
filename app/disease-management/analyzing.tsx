import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  StatusBar,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useLanguage } from "../../context/LanguageContext";

const { width } = Dimensions.get("window");

type AnalysisStep = {
  id: number;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: "pending" | "processing" | "completed";
};

export default function AnalyzingScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();
  const { t } = useLanguage();

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      id: 1,
      title: t("imagePreprocessing"),
      icon: "image-outline",
      status: "pending",
    },
    {
      id: 2,
      title: t("featureExtraction"),
      icon: "scan-outline",
      status: "pending",
    },
    {
      id: 3,
      title: t("diseaseClassification"),
      icon: "analytics-outline",
      status: "pending",
    },
    {
      id: 4,
      title: t("generatingReport"),
      icon: "document-text-outline",
      status: "pending",
    },
  ]);

  const displayImage =
    imageUri ||
    "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400";

  useEffect(() => {
    analyzeImage();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    const totalDuration = 6000;
    const stepDuration = totalDuration / steps.length;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, totalDuration / 100);

    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        setSteps((prevSteps) =>
          prevSteps.map((s, i) => {
            if (i < index) return { ...s, status: "completed" };
            if (i === index) return { ...s, status: "processing" };
            return s;
          })
        );

        if (scrollViewRef.current && index > 0) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({
              y: 300 + index * 70,
              animated: true,
            });
          }, 100);
        }
      }, index * stepDuration);
    });

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  const analyzeImage = async () => {
    const API_URL = "http://192.168.8.158:8000/api/disease/detect";

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri as string,
        name: "aloe_leaf.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const result = await response.json();
      setAnalysisResult(result);

      setTimeout(() => {
        router.replace({
          pathname: "/disease-management/result",
          params: {
            disease: result.disease,
            confidence: result.confidence,
          },
        });
      }, 6500);
    } catch (error) {
      console.error(error);
      setTimeout(() => {
        router.replace({
          pathname: "/disease-management/result",
          params: {
            disease: t("analysisError"),
            confidence: 0,
          },
        });
      }, 6500);
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
      <LinearGradient
        colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
        style={styles.container}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.imageSection}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: displayImage as string }}
                  style={styles.leafImage}
                />

                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{ translateY: scanLineTranslate }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[
                      "transparent",
                      "rgba(46, 125, 50, 0.6)",
                      "transparent",
                    ]}
                    style={styles.scanLineGradient}
                  />
                </Animated.View>

                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </View>
            </View>

            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [{ rotate: rotation }, { scale: pulseAnim }],
                },
              ]}
            >
              <Ionicons name="analytics" size={48} color="#2E7D32" />
            </Animated.View>

            <Text style={styles.title}>{t("analyzingLeaf")}</Text>
            <Text style={styles.subtitle}>
              {t("aiExaminingLeaf")}
            </Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    { width: progressWidth },
                  ]}
                >
                  <LinearGradient
                    colors={["#2E7D32", "#66BB6A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressGradient}
                  />
                </Animated.View>
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>

            <View style={styles.stepsContainer}>
              {steps.map((step, index) => {
                const isCompleted = step.status === "completed";
                const isProcessing = step.status === "processing";
                const stepScaleAnim = useRef(new Animated.Value(1)).current;

                useEffect(() => {
                  if (isProcessing) {
                    Animated.sequence([
                      Animated.timing(stepScaleAnim, {
                        toValue: 1.05,
                        duration: 200,
                        useNativeDriver: true,
                      }),
                      Animated.timing(stepScaleAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                      }),
                    ]).start();
                  }
                }, [isProcessing]);

                return (
                  <Animated.View
                    key={step.id}
                    style={[
                      styles.stepCard,
                      isProcessing && styles.stepCardActive,
                      isCompleted && styles.stepCardCompleted,
                      {
                        transform: [{ scale: stepScaleAnim }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.stepIconBg,
                        isProcessing && styles.stepIconBgActive,
                        isCompleted && styles.stepIconBgCompleted,
                      ]}
                    >
                      {isCompleted ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#2E7D32"
                        />
                      ) : isProcessing ? (
                        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                          <Ionicons
                            name={step.icon}
                            size={24}
                            color="#2E7D32"
                          />
                        </Animated.View>
                      ) : (
                        <Ionicons
                          name={step.icon}
                          size={24}
                          color="#A5D6A7"
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepText,
                        isProcessing && styles.stepTextActive,
                        isCompleted && styles.stepTextCompleted,
                      ]}
                    >
                      {step.title}
                    </Text>
                    {isProcessing && (
                      <View style={styles.processingDot}>
                        <Animated.View
                          style={[
                            styles.processingDotInner,
                            { transform: [{ scale: pulseAnim }] },
                          ]}
                        />
                      </View>
                    )}
                  </Animated.View>
                );
              })}
            </View>

            <View style={styles.infoFooter}>
              <Ionicons name="shield-checkmark" size={18} color="#2E7D32" />
              <Text style={styles.infoText}>
                {t("secureAiPoweredAnalysis")}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  imageSection: {
    marginBottom: 24,
  },
  imageWrapper: {
    width: width - 100,
    height: width - 100,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    borderWidth: 3,
    borderColor: "#81C784",
    backgroundColor: "#FFFFFF",
  },
  leafImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  scanLine: {
    position: "absolute",
    width: "100%",
    height: 80,
    zIndex: 10,
  },
  scanLineGradient: {
    flex: 1,
  },
  cornerTL: {
    position: "absolute",
    top: -3,
    left: -3,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#2E7D32",
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#2E7D32",
    borderTopRightRadius: 16,
  },
  cornerBL: {
    position: "absolute",
    bottom: -3,
    left: -3,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#2E7D32",
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#2E7D32",
    borderBottomRightRadius: 16,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#4E6E4E",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 24,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 32,
  },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressGradient: {
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginTop: 8,
  },
  stepsContainer: {
    width: "100%",
    gap: 12,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  stepCardActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#2E7D32",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  stepCardCompleted: {
    backgroundColor: "#E8F5E9",
    borderColor: "#A5D6A7",
  },
  stepIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  stepIconBgActive: {
    backgroundColor: "#E8F5E9",
  },
  stepIconBgCompleted: {
    backgroundColor: "#FFFFFF",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#757575",
    fontWeight: "500",
  },
  stepTextActive: {
    color: "#1B5E20",
    fontWeight: "700",
  },
  stepTextCompleted: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  processingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#A5D6A7",
    justifyContent: "center",
    alignItems: "center",
  },
  processingDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2E7D32",
  },
  infoFooter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 24,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },
});