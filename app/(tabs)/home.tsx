import CourseCard from "@/components/CourseCard";
import HeroCard from "@/components/HeroCard";
import OfflineBanner from "@/components/OfflineBanner";
import SearchBar from "@/components/SearchBar";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { useCourseStore } from "@/store/courseStore";
import { Course } from "@/types";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ITEM_HEIGHT = 348;

export default function HomeScreen() {
  const fetchCourses = useCourseStore((s) => s.fetchCourses);
  const fetchMore = useCourseStore((s) => s.fetchMore);
  const isLoading = useCourseStore((s) => s.isLoading);
  const isRefreshing = useCourseStore((s) => s.isRefreshing);
  const error = useCourseStore((s) => s.error);
  const hasMore = useCourseStore((s) => s.hasMore);
  const searchQuery = useCourseStore((s) => s.searchQuery);
  const setSearchQuery = useCourseStore((s) => s.setSearchQuery);
  const getFilteredCourses = useCourseStore((s) => s.getFilteredCourses);
  const user = useAuthStore((s) => s.user);
  const courses = getFilteredCourses();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const renderItem: ListRenderItem<Course> = useCallback(
    ({ item }) => <CourseCard course={item} />,
    [],
  );
  const keyExtractor = useCallback((item: Course) => item.id, []);
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const displayName =
    user?.fullName?.split(" ")[0] || user?.username || "Learner";

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeaderWrap}>
        <HeroCard name={displayName} />
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <View style={styles.sectionRow}>
          {searchQuery ? (
            <>
              <Text style={styles.sectionTitle}>
                Results for "{searchQuery}"
              </Text>
              <Text style={styles.countText}>{courses.length} found</Text>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>All Courses</Text>
              <View style={styles.countChip}>
                <Text style={styles.countChipText}>
                  {courses.length} courses
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    ),
    [displayName, searchQuery, setSearchQuery, courses.length],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading)
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching courses...</Text>
        </View>
      );
    if (error)
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={styles.emptyTitle}>Failed to load</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchCourses()}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    if (searchQuery && courses.length === 0)
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptySubtitle}>
            No results for "{searchQuery}"
          </Text>
        </View>
      );
    return null;
  }, [isLoading, error, searchQuery, courses.length, fetchCourses]);

  const handleEndReached = useCallback(() => fetchMore(), [fetchMore]);

  const refresh = useCallback(() => fetchCourses(true), [fetchCourses]);

  const listFooter = useMemo(
    () =>
      hasMore && isLoading && courses.length > 0 ? (
        <View style={styles.footerLoader}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <View style={styles.footerSpacer} />
      ),
    [hasMore, isLoading, courses.length],
  );

  return (
    // edges={[]} removes ALL safe area borders including the red top line
    <SafeAreaView style={styles.container} edges={["top"]}>
      <OfflineBanner />
      <FlatList
        data={courses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={listFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        removeClippedSubviews
        maxToRenderPerBatch={4}
        windowSize={7}
        initialNumToRender={4}
        updateCellsBatchingPeriod={50}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  listHeaderWrap: { paddingTop: 4 },

  // Section label
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 2,
  },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  countChip: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  countChipText: { color: Colors.textDim, fontSize: 11 },
  countText: { color: Colors.textDim, fontSize: 13 },

  // Empty / loading
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 14 },
  loadingText: { color: Colors.textMuted, fontSize: 14, marginTop: 12 },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: { color: Colors.textMuted, fontSize: 14, textAlign: "center" },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  retryText: { color: Colors.white, fontWeight: "700" },

  // Footer
  footerLoader: { paddingVertical: 24, alignItems: "center" },
  footerSpacer: { height: 20 },
});
