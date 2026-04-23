// app/_layout.tsx
import { useKeepAwake } from "expo-keep-awake";
import { Stack } from "expo-router";
import { LanguageProvider } from "../context/LanguageContext";

export default function RootLayout() {
  useKeepAwake();

  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="landing" />
        <Stack.Screen name="language" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="yield-management" />
        <Stack.Screen name="fertilizer-management" />
        <Stack.Screen name="disease-management/index" />
      </Stack>
    </LanguageProvider>
  );
}