import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuthStore } from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import "../global.css";

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const loadFromStorage = useBookmarkStore((s) => s.loadFromStorage);

  useEffect(() => {
    initialize();
    loadFromStorage();
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course/[id]" />
        <Stack.Screen
          name="course/webview"
          options={{ presentation: "modal" }}
        />
      </Stack>
      <Toast />
    </ErrorBoundary>
  );
}
