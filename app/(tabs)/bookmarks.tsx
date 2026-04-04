import CourseCard from "@/components/CourseCard";
import { Colors } from "@/constants/colors";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookmarksScreen() {
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const courses = useMemo(() => Object.values(bookmarks), [bookmarks]);

  const renderItem = useCallback(
    ({ item }: { item: Course }) => <CourseCard course={item} />,
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Saved Courses</Text>
          <Text style={styles.subtitle}>
            {courses.length} course{courses.length !== 1 ? "s" : ""} bookmarked
          </Text>
        </View>
        {courses.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{courses.length}</Text>
          </View>
        )}
      </View>

      {/* Stats strip */}
      {courses.length > 0 && (
        <View style={styles.statsStrip}>
          <View style={styles.stripItem}>
            <Ionicons name="bookmark" size={14} color={Colors.primary} />
            <Text style={styles.stripText}>{courses.length} Saved</Text>
          </View>
          <View style={styles.stripDot} />
          <View style={styles.stripItem}>
            <Ionicons name="grid-outline" size={14} color={Colors.primary} />
            <Text style={styles.stripText}>
              {new Set(courses.map((c) => c.category)).size} Categories
            </Text>
          </View>
          <View style={styles.stripDot} />
          <View style={styles.stripItem}>
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text style={styles.stripText}>
              {courses.length > 0
                ? (
                    courses.reduce((a, c) => a + (c.rating || 0), 0) /
                    courses.length
                  ).toFixed(1)
                : "0"}{" "}
              Avg
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={courses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
          paddingTop: 8,
        }}
        removeClippedSubviews
        maxToRenderPerBatch={4}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons
                name="bookmark-outline"
                size={40}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>No saved courses</Text>
            <Text style={styles.emptySub}>
              Bookmark courses you want to revisit.{"\n"}They'll all appear
              here.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/home")}
              style={styles.browseBtn}
            >
              <Ionicons name="compass-outline" size={16} color="#fff" />
              <Text style={styles.browseBtnText}>Browse Courses</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginTop: 3 },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 4,
  },
  countText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  statsStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 12,
  },
  stripItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  stripText: { color: Colors.textMuted, fontSize: 12, fontWeight: "600" },
  stripDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textDim,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(124,58,237,0.1)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptySub: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  browseBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
