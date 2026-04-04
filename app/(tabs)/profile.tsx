import { Colors } from "@/constants/colors";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const enrolled = useBookmarkStore((s) => s.enrolled);
  const [uploading, setUploading] = useState(false);

  const bookmarkCount = Object.keys(bookmarks).length;
  const enrolledCount = Object.keys(enrolled).length;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure?", [
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
      Toast.show({ type: "error", text1: "Photo access required" });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("avatar", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "avatar.jpg",
        } as unknown as Blob);
        const updated = await authService.updateAvatar(formData);
        updateUser(updated);
        Toast.show({ type: "success", text1: "Avatar updated!" });
      } catch {
        Toast.show({ type: "error", text1: "Upload failed" });
      } finally {
        setUploading(false);
      }
    }
  };

  const initials = (user?.fullName || user?.username || "L")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerPattern} />
          <Text style={styles.bannerTitle}>My Profile</Text>
        </View>

        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handlePickAvatar}
            style={styles.avatarWrap}
            activeOpacity={0.85}
          >
            {user?.avatar?.url ? (
              <Image
                source={{ uri: user.avatar.url }}
                style={styles.avatarImg}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraBtn}>
              {uploading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons name="camera" size={14} color={Colors.white} />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>
            {user?.fullName || user?.username}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || "Student"}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: "library-outline", val: enrolledCount, label: "Enrolled" },
            { icon: "bookmark-outline", val: bookmarkCount, label: "Saved" },
            {
              icon: "trophy-outline",
              val: enrolledCount > 0 ? 1 : 0,
              label: "Certificates",
            },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={22} color={Colors.primary} />
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Account Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Account Info</Text>
          {[
            {
              icon: "person-outline",
              label: "Username",
              value: `@${user?.username}`,
            },
            { icon: "mail-outline", label: "Email", value: user?.email || "—" },
            {
              icon: "calendar-outline",
              label: "Member Since",
              value: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "—",
            },
            {
              icon: "shield-checkmark-outline",
              label: "Email Verified",
              value: user?.isEmailVerified ? "Verified ✓" : "Not verified",
            },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              style={[
                styles.infoRow,
                i < arr.length - 1 && styles.infoRowBorder,
              ]}
            >
              <View style={styles.infoIconWrap}>
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={Colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Settings</Text>
          {[
            {
              icon: "notifications-outline",
              label: "Notifications",
              sub: "Push & reminders",
            },
            {
              icon: "download-outline",
              label: "Downloads",
              sub: "Offline content",
            },
            {
              icon: "help-circle-outline",
              label: "Help & Support",
              sub: "FAQ & contact",
            },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.settingRow,
                i < arr.length - 1 && styles.infoRowBorder,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.infoIconWrap}>
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={Colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoValue}>{item.label}</Text>
                <Text style={styles.infoLabel}>{item.sub}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.textDim}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Learnify v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  banner: {
    height: 120,
    backgroundColor: Colors.primary,
    justifyContent: "flex-end",
    padding: 20,
    overflow: "hidden",
  },
  bannerPattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primaryDark,
    opacity: 0.4,
    borderRadius: 200,
    width: 300,
    height: 300,
    top: -100,
    right: -80,
  },
  bannerTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: -40,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  avatarWrap: { position: "relative", marginBottom: 14 },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.bg,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { color: "#fff", fontSize: 28, fontWeight: "800" },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryDark,
    borderWidth: 2,
    borderColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  userEmail: { color: Colors.textMuted, fontSize: 14, marginBottom: 10 },
  roleBadge: {
    backgroundColor: "rgba(124,58,237,0.15)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.3)",
  },
  roleText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statVal: { color: Colors.text, fontSize: 20, fontWeight: "800" },
  statLabel: { color: Colors.textDim, fontSize: 11 },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: "hidden",
  },
  sectionHeading: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(124,58,237,0.1)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { color: Colors.textDim, fontSize: 11, marginBottom: 2 },
  infoValue: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: "700" },
  version: { color: Colors.textDim, fontSize: 12, textAlign: "center" },
});
