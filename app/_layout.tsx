import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Colors } from "@/constants/colors";
import { useNotifications } from "@/hooks/useNotifications";
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

  useNotifications();

  useEffect(() => {
    initialize();
    loadFromStorage();
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          // Fix white flash on navigation
          animation: "slide_from_right",
          animationDuration: 200,
        }}
      >
        <Stack.Screen name="index" options={{ animation: "none" }} />
        <Stack.Screen name="(auth)" options={{ animation: "none" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen
          name="course/[id]"
          options={{
            animation: "slide_from_right",
            contentStyle: { backgroundColor: Colors.bg },
          }}
        />
        <Stack.Screen
          name="course/webview"
          options={{
            animation: "slide_from_bottom",
            presentation: "modal",
            contentStyle: { backgroundColor: Colors.bg },
          }}
        />
      </Stack>
      <Toast />
    </ErrorBoundary>
  );
}
