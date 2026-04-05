import AppModal from "@/components/Modal";
import { Colors } from "@/constants/colors";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const BANNER_H = 160;

const CIRCLES = [
  { top: -30, left: -30, size: 140, opacity: 0.12 },
  { top: 20, left: width * 0.5, size: 100, opacity: 0.08 },
  { top: -10, left: width * 0.75, size: 80, opacity: 0.1 },
  { top: 60, left: width * 0.25, size: 60, opacity: 0.07 },
  { top: 80, left: width * 0.65, size: 120, opacity: 0.06 },
];

// Generate a consistent dicebear avatar URL from username/email
function getDefaultAvatarUrl(seed: string): string {
  const cleanSeed = encodeURIComponent(seed || "user");
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${cleanSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc&radius=50`;
}

function AvatarImage({
  uri,
  fallbackUri,
  style,
}: {
  uri?: string;
  fallbackUri: string;
  style: object;
}) {
  const [imgUri, setImgUri] = useState(uri || fallbackUri);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgUri(uri || fallbackUri);
    setHasError(false);
  }, [uri, fallbackUri]);

  return (
    <Image
      source={{ uri: hasError ? fallbackUri : imgUri }}
      style={style}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgUri(fallbackUri);
        }
      }}
    />
  );
}

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const enrolled = useBookmarkStore((s) => s.enrolled);
  const [uploading, setUploading] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  const bookmarkCount = Object.keys(bookmarks).length;
  const enrolledCount = Object.keys(enrolled).length;

  const defaultAvatar = getDefaultAvatarUrl(
    user?.username || user?.email || "learner",
  );
  const avatarUri = user?.avatar?.url || defaultAvatar;

  const initials = (user?.fullName || user?.username || "L")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
        } as any);
        const updated = await authService.updateAvatar(formData);
        updateUser(updated);
        Toast.show({ type: "success", text1: "Avatar updated!" });
      } catch {
        Toast.show({
          type: "error",
          text1: "Upload failed",
          text2: "Could not update avatar",
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Banner */}
        <View style={styles.banner}>
          {CIRCLES.map((c, i) => (
            <View
              key={i}
              style={[
                styles.circle,
                {
                  top: c.top,
                  left: c.left,
                  width: c.size,
                  height: c.size,
                  borderRadius: c.size / 2,
                  opacity: c.opacity,
                },
              ]}
            />
          ))}
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Profile</Text>
            <Text style={styles.bannerSub}>Manage your account</Text>
          </View>
        </View>

        {/* Avatar section */}
        <Animated.View
          style={[
            styles.avatarSection,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          <TouchableOpacity
            onPress={handlePickAvatar}
            style={styles.avatarWrap}
            activeOpacity={0.85}
            disabled={uploading}
          >
            {/* Avatar image with dicebear fallback */}
            <AvatarImage
              uri={user?.avatar?.url}
              fallbackUri={defaultAvatar}
              style={styles.avatarImg}
            />

            {/* Upload overlay while uploading */}
            {uploading && (
              <View style={styles.avatarUploadOverlay}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            )}

            {/* Camera button */}
            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={13} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>
            {user?.fullName || user?.username}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Ionicons
                name="school-outline"
                size={12}
                color={Colors.primary}
              />
              <Text style={styles.roleText}>{user?.role || "Student"}</Text>
            </View>
            {user?.isEmailVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={Colors.success}
                />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsRow, { opacity: fadeIn }]}>
          {[
            {
              icon: "library-outline",
              val: String(enrolledCount),
              label: "Enrolled",
            },
            {
              icon: "bookmark-outline",
              val: String(bookmarkCount),
              label: "Saved",
            },
            {
              icon: "trophy-outline",
              val: String(enrolledCount > 0 ? 1 : 0),
              label: "Certs",
            },
            {
              icon: "time-outline",
              val: `${enrolledCount * 4}h`,
              label: "Hours",
            },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={18} color={Colors.primary} />
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View
          style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}
        >
          {/* Account Info */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Ionicons
                name="person-circle-outline"
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.sectionTitle}>Account Info</Text>
            </View>

            {/* Avatar row in account info */}
            <View style={[styles.row, styles.rowBorder]}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name="image-outline"
                  size={15}
                  color={Colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Profile Photo</Text>
                <Text style={styles.rowValue}>
                  {user?.avatar?.url ? "Custom photo" : "Default avatar"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handlePickAvatar}
                disabled={uploading}
                style={styles.changeBtn}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.changeBtnText}>Change</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Avatar preview row */}
            <View style={[styles.avatarPreviewRow, styles.rowBorder]}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name="person-outline"
                  size={15}
                  color={Colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Current Avatar</Text>
                <Text style={styles.rowValue} numberOfLines={1}>
                  {user?.avatar?.url
                    ? "Uploaded photo"
                    : `Auto-generated · @${user?.username}`}
                </Text>
              </View>
              <AvatarImage
                uri={user?.avatar?.url}
                fallbackUri={defaultAvatar}
                style={styles.miniAvatar}
              />
            </View>

            {[
              {
                icon: "at-outline",
                label: "Username",
                value: `@${user?.username}`,
              },
              {
                icon: "mail-outline",
                label: "Email",
                value: user?.email || "—",
              },
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
            ].map((item, i, arr) => (
              <View
                key={item.label}
                style={[styles.row, i < arr.length - 1 && styles.rowBorder]}
              >
                <View style={styles.iconWrap}>
                  <Ionicons
                    name={item.icon as any}
                    size={15}
                    color={Colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Settings */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Ionicons
                name="settings-outline"
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.sectionTitle}>Settings</Text>
            </View>
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
                icon: "shield-outline",
                label: "Privacy",
                sub: "Data & security",
              },
              {
                icon: "help-circle-outline",
                label: "Help & Support",
                sub: "FAQ & contact",
              },
            ].map((item, i, arr) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.row, i < arr.length - 1 && styles.rowBorder]}
                activeOpacity={0.7}
              >
                <View style={styles.iconWrap}>
                  <Ionicons
                    name={item.icon as any}
                    size={15}
                    color={Colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowValue}>{item.label}</Text>
                  <Text style={styles.rowLabel}>{item.sub}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={15}
                  color={Colors.textDim}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={() => setLogoutModal(true)}
            style={styles.logoutBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={Colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Learnify v1.0.0</Text>
        </Animated.View>
      </ScrollView>

      <AppModal
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        icon="log-out-outline"
        iconColor={Colors.error}
        title="Sign Out?"
        message="You'll need to sign back in to access your courses and bookmarks."
        actions={[
          { label: "Sign Out", variant: "danger", onPress: handleLogout },
          { label: "Cancel", variant: "ghost", onPress: () => {} },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // Banner
  banner: {
    height: BANNER_H,
    backgroundColor: Colors.primary,
    overflow: "hidden",
    position: "relative",
    justifyContent: "flex-end",
  },
  circle: { position: "absolute", backgroundColor: "#fff" },
  bannerContent: { padding: 20, paddingBottom: 18 },
  bannerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  bannerSub: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 },

  // Avatar
  avatarSection: {
    alignItems: "center",
    marginTop: -44,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatarImg: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 4,
    borderColor: Colors.bg,
    backgroundColor: Colors.surface,
  },
  avatarUploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 52,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
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
    marginBottom: 3,
  },
  userEmail: { color: Colors.textMuted, fontSize: 13, marginBottom: 10 },
  badgeRow: { flexDirection: "row", gap: 8 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(124,58,237,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.25)",
  },
  roleText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16,185,129,0.1)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.25)",
  },
  verifiedText: { color: Colors.success, fontSize: 12, fontWeight: "700" },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statVal: { color: Colors.text, fontSize: 17, fontWeight: "800" },
  statLabel: { color: Colors.textDim, fontSize: 10 },

  // Section cards
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: "hidden",
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  avatarPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(124,58,237,0.1)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { color: Colors.textDim, fontSize: 11, marginBottom: 1 },
  rowValue: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  changeBtn: {
    backgroundColor: "rgba(124,58,237,0.12)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.25)",
    minWidth: 60,
    alignItems: "center",
  },
  changeBtnText: { color: Colors.primary, fontSize: 12, fontWeight: "700" },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "rgba(239,68,68,0.07)",
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.18)",
  },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: "700" },
  version: {
    color: Colors.textDim,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
});
