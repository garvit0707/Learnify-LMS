import CourseCard from "@/components/CourseCard";
import OfflineBanner from "@/components/OfflineBanner";
import SearchBar from "@/components/SearchBar";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { useCourseStore } from "@/store/courseStore";
import { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef } from "react";
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

=======
  ActivityIndicator,
  Animated,
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

function HeroCard({ name }: { name: string }) {
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    const makeFloat = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -10,
            duration: 2200 + delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2200 + delay,
            useNativeDriver: true,
          }),
        ]),
      ).start();

    makeFloat(float1, 0);
    makeFloat(float2, 400);
    makeFloat(float3, 700);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const greetEmoji = hour < 12 ? "☀️" : hour < 17 ? "👋" : "🌙";

  return (
    <Animated.View style={[styles.hero, { opacity: fadeIn }]}>
      {/* Decorative blobs */}
      <Animated.View
        style={[styles.blob1, { transform: [{ translateY: float1 }] }]}
      />
      <Animated.View
        style={[styles.blob2, { transform: [{ translateY: float2 }] }]}
      />
      <Animated.View
        style={[styles.blob3, { transform: [{ translateY: float3 }] }]}
      />

      {/* Floating icons */}
      <Animated.View
        style={[styles.fi, styles.fi1, { transform: [{ translateY: float1 }] }]}
      >
        <Text style={styles.fiText}>📚</Text>
      </Animated.View>
      <Animated.View
        style={[styles.fi, styles.fi2, { transform: [{ translateY: float2 }] }]}
      >
        <Text style={styles.fiText}>🏆</Text>
      </Animated.View>
      <Animated.View
        style={[styles.fi, styles.fi3, { transform: [{ translateY: float3 }] }]}
      >
        <Text style={[styles.fiText, { fontSize: 16 }]}>⚡</Text>
      </Animated.View>

      <View style={styles.heroContent}>
        <Text style={styles.heroGreeting}>
          {greeting} {greetEmoji}
        </Text>
        <Text style={styles.heroName}>{name}</Text>
        <Text style={styles.heroSub}>What are you learning today?</Text>
        <View style={styles.heroPillRow}>
          <View style={styles.heroPill}>
            <Ionicons name="flash" size={11} color={Colors.primary} />
            <Text style={styles.heroPillText}>Top Rated</Text>
          </View>
          <View style={styles.heroPill}>
            <Ionicons name="star" size={11} color="#FBBF24" />
            <Text style={styles.heroPillText}>Expert Led</Text>
          </View>
          <View style={styles.heroPill}>
            <Ionicons name="ribbon-outline" size={11} color={Colors.success} />
            <Text style={styles.heroPillText}>Certified</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

>>>>>>> Stashed changes
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
  }, []);

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
  const onRefresh = useCallback(() => fetchCourses(true), [fetchCourses]);
  const onEndReached = useCallback(() => fetchMore(), [fetchMore]);

  const ListHeader = (
    <View style={styles.listHeader}>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
    </View>
  );

  const renderEmpty = () => {
    if (isLoading)
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyText}>Loading courses...</Text>
        </View>
      );
    if (error)
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>😕</Text>
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
    if (searchQuery)
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptySubtitle}>
            No results for "{searchQuery}"
          </Text>
        </View>
      );
    return null;
  };

  const renderFooter = () => {
    if (!hasMore || courses.length === 0) return null;
    if (isLoading)
      return (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      );
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <OfflineBanner />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello,{" "}
            {user?.fullName?.split(" ")[0] || user?.username || "Learner"} 👋
          </Text>
          <Text style={styles.headline}>Explore Courses</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>
            {(user?.fullName || user?.username || "L")[0].toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{courses.length}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>Free</Text>
          <Text style={styles.statLabel}>Access</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>HD</Text>
          <Text style={styles.statLabel}>Quality</Text>
        </View>
      </View>

=======
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const ListHeader = (
    <View style={styles.listHeaderWrap}>
      <HeroCard
        name={user?.fullName?.split(" ")[0] || user?.username || "Learner"}
      />
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      {!searchQuery && (
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>All Courses</Text>
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>{courses.length} courses</Text>
          </View>
        </View>
      )}
      {searchQuery && (
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Results for "{searchQuery}"</Text>
          <Text style={styles.countText}>{courses.length} found</Text>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
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
          <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
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
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
          <Text style={styles.emptySubtitle}>
            No results for "{searchQuery}"
          </Text>
        </View>
      );
    return null;
  };

  return (
    // edges={[]} removes ALL safe area borders including the red top line
    <SafeAreaView style={styles.container} edges={["top"]}>
      <OfflineBanner />
>>>>>>> Stashed changes
      <FlatList
        data={courses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
<<<<<<< Updated upstream
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: { color: Colors.textMuted, fontSize: 14, marginBottom: 4 },
  headline: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  avatarLetter: { color: Colors.white, fontSize: 18, fontWeight: "700" },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  statLabel: { color: Colors.textDim, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.surfaceBorder },
  listHeader: { paddingTop: 4 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: { color: Colors.textMuted, fontSize: 14, marginTop: 12 },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryText: { color: Colors.white, fontWeight: "700" },
});
