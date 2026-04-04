import { Colors } from "@/constants/colors";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface Props {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ message, fullScreen = false }: Props) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-dark-900">
        <ActivityIndicator size="large" color={Colors.primary} />
        {message && (
          <Text className="text-slate-400 mt-3 text-sm">{message}</Text>
        )}
      </View>
    );
  }

  return (
    <View className="py-8 items-center justify-center">
      <ActivityIndicator size="small" color={Colors.primary} />
      {message && (
        <Text className="text-slate-400 mt-2 text-xs">{message}</Text>
      )}
    </View>
  );
}
