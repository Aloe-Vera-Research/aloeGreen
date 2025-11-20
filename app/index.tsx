// app/index.tsx
import { useEffect } from "react";
import { useRouter } from "expo-router";

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
