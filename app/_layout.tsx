// app/_layout.tsx
import { useKeepAwake } from "expo-keep-awake";
import { Stack } from "expo-router";
 
export default function RootLayout() {
  useKeepAwake();
 
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Landing page will be recognized automatically */}
      <Stack.Screen name="landing" />
 
      <Stack.Screen name="(tabs)" />

      <Stack.Screen name="yield-management" />

      <Stack.Screen name="fertilizer-management" />

      <Stack.Screen name="disease-management" />
    </Stack>
  );
}