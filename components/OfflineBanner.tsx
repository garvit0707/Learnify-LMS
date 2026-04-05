import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import React from "react";
import { Text, View } from "react-native";

export default function OfflineBanner() {
  const { isConnected } = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View className="bg-red-500 px-4 py-2 items-center">
      <Text className="text-white font-semibold text-sm">
        📡 No internet connection
      </Text>
    </View>
  );
}
