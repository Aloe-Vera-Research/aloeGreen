import { Tabs } from "expo-router";
import {
  FileText,
  LayoutDashboard,
  Plus,
  ShieldAlert,
  TrendingUp,
} from "lucide-react-native";
import { View } from "react-native";

const GREEN = "#16a34a";       // primary green
const GREEN_LIGHT = "#dcfce7"; // soft green bg
const GRAY = "#9ca3af";
const DARK = "#14532d";

export default function PriceManagementLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: GREEN,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="overview"
        options={{
          title: "Overview",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <LayoutDashboard color={color} size={22} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="analysis"
        options={{
          title: "Analysis",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <TrendingUp color={color} size={22} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: GREEN,
                padding: 14,
                borderRadius: 999,
                marginBottom: 20,
                shadowColor: GREEN,
                shadowOpacity: 0.35,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              <Plus color="#ffffff" size={22} />
            </View>
          ),
          tabBarLabelStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="risk"
        options={{
          title: "Risk",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <ShieldAlert color={color} size={22} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="records"
        options={{
          title: "Records",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <FileText color={color} size={22} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

/* ================= TAB ICON WRAPPER ================= */

function TabIcon({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        padding: 8,
        borderRadius: 12,
        backgroundColor: focused ? GREEN_LIGHT : "transparent",
      }}
    >
      {children}
    </View>
  );
}
