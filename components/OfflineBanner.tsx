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
<<<<<<< Updated upstream
=======

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    // backgroundColor: Colors.error,
    paddingVertical: 10,
  },
  text: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
>>>>>>> Stashed changes
