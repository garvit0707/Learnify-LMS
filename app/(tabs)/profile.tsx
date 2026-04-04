import { Colors } from "@/constants/colors";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const { getBookmarkedCourses, enrolled } = useBookmarkStore();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const bookmarkCount = getBookmarkedCourses().length;
  const enrolledCount = Object.keys(enrolled).length;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission required",
        text2: "Please allow photo access to update your avatar",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadingAvatar(true);
      try {
        const formData = new FormData();
        formData.append("avatar", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "avatar.jpg",
        } as unknown as Blob);

        const updatedUser = await authService.updateAvatar(formData);
        updateUser(updatedUser);
        Toast.show({ type: "success", text1: "Avatar updated!" });
      } catch {
        Toast.show({ type: "error", text1: "Failed to update avatar" });
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const StatCard = ({
    value,
    label,
    emoji,
  }: {
    value: number;
    label: string;
    emoji: string;
  }) => (
    <View className="flex-1 bg-dark-800 rounded-2xl p-4 items-center border border-dark-700">
      <Text className="text-2xl mb-1">{emoji}</Text>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-slate-400 text-xs mt-1 text-center">{label}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-900" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-6 pb-8">
          {/* Avatar */}
          <View className="items-center mb-6">
            <TouchableOpacity onPress={handlePickAvatar} className="relative">
              {user?.avatar?.url ? (
                <Image
                  source={{ uri: user.avatar.url }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-primary-500 items-center justify-center">
                  <Text className="text-white text-3xl font-bold">
                    {(user?.fullName || user?.username || "?")[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-dark-800 rounded-full p-2 border-2 border-primary-500">
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text className="text-xs">📷</Text>
                )}
              </View>
            </TouchableOpacity>

            <Text className="text-white text-xl font-bold mt-4">
              {user?.fullName || user?.username}
            </Text>
            <Text className="text-slate-400 text-sm mt-1">{user?.email}</Text>
            <View className="bg-primary-500/20 px-3 py-1 rounded-full mt-2">
              <Text className="text-primary-500 text-xs font-semibold capitalize">
                {user?.role || "student"}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row gap-3 mb-6">
            <StatCard value={enrolledCount} label="Enrolled" emoji="📚" />
            <StatCard value={bookmarkCount} label="Bookmarked" emoji="🔖" />
          </View>

          {/* Info */}
          <View className="bg-dark-800 rounded-2xl border border-dark-700 mb-4 overflow-hidden">
            {[
              {
                label: "Username",
                value: `@${user?.username}`,
              },
              {
                label: "Email",
                value: user?.email || "",
              },
              {
                label: "Member Since",
                value: user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "—",
              },
            ].map((item, i, arr) => (
              <View
                key={item.label}
                className={`px-4 py-3.5 flex-row justify-between items-center ${
                  i < arr.length - 1 ? "border-b border-dark-700" : ""
                }`}
              >
                <Text className="text-slate-400 text-sm">{item.label}</Text>
                <Text className="text-white text-sm font-medium">
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl py-4 items-center mt-2"
          >
            <Text className="text-red-400 font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
