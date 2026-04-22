import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, View, StyleSheet } from "react-native";
import { useLanguage } from "../../context/LanguageContext";

function TabIcon({
  name,
  color,
  focused,
  lib = "ion",
}: {
  name: string;
  color: string;
  focused: boolean;
  lib?: "ion" | "mci" | "symbol";
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      {lib === "mci" ? (
        <MaterialCommunityIcons name={name as any} size={22} color={color} />
      ) : lib === "symbol" ? (
        <IconSymbol size={22} name={name as any} color={color} />
      ) : (
        <Ionicons name={name as any} size={22} color={color} />
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "#BDBDBD",
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("home"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="house.fill" color={color} focused={focused} lib="symbol" />
          ),
        }}
      />

      <Tabs.Screen
        name="chatbot"
        options={{
          title: t("assistant"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chatbubbles" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="live-stats"
        options={{
          title: t("liveStats"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bar-chart-outline" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: t("about"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="information-circle" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    height: Platform.OS === "ios" ? 88 : 68,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
    paddingTop: 10,
    paddingHorizontal: 8,
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
  },
  tabItem: {
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  iconWrap: {
    width: 44,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapActive: {
    backgroundColor: "#E8F5E9",
  },
});