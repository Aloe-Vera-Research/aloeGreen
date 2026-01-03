// app/_layout.tsx
import { useKeepAwake } from "expo-keep-awake";
import { Stack } from "expo-router";
 
export default function RootLayout() {
  useKeepAwake();
 
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Landing page will be recognized automatically */}
      <Stack.Screen name="landing" />
 
      {/* Tabs group */}
      <Stack.Screen name="(tabs)" />
 
      {/* Fertilizer stack */}
      <Stack.Screen name="fertilizer" />
    </Stack>
  );
}