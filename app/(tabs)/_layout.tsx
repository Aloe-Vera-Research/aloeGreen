import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarActiveTintColor: "#2E7D32",
      tabBarInactiveTintColor: "#757575"
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "AI Assistant",
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color }) => <Ionicons name="information-circle" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
  name="live-stats"
  options={{
    title: "Live Stats",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="pulse-outline" size={size} color={color} />
    ),
  }}
/>

      
    </Tabs>
  );
}