// app/index.tsx
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // wait a tick so RootLayout mounts first
    setTimeout(() => {
      router.replace("/landing");
    }, 0);
  }, []);

  return null;
}
