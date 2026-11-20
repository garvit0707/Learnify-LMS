import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    setTimeout(() => {
      router.replace("/(tabs)/home");
    }, 2000);
    // if (!isLoading) {
    //   if (isAuthenticated) {
    //     router.replace("/(tabs)/home");
    //   } else {
    //     router.replace("/(auth)/login");
    //   }
    // }
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
