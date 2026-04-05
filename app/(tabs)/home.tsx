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
      <FlatList
        data={courses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          hasMore && isLoading && courses.length > 0 ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <View style={{ height: 20 }} />
          )
        }
        onEndReached={() => fetchMore()}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchCourses(true)}
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

  // Hero
  hero: {
    margin: 16,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: "hidden",
    minHeight: 156,
    position: "relative",
  },
  blob1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(124,58,237,0.13)",
  },
  blob2: {
    position: "absolute",
    bottom: -40,
    left: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(6,182,212,0.09)",
  },
  blob3: {
    position: "absolute",
    top: 20,
    left: "45%",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(124,58,237,0.06)",
  },
  fi: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 14,
    padding: 9,
  },
  fi1: { top: 14, right: 16 },
  fi2: { top: 62, right: 72 },
  fi3: { bottom: 18, right: 28 },
  fiText: { fontSize: 20 },
  heroContent: { padding: 22, paddingRight: 88 },
  heroGreeting: { color: Colors.textMuted, fontSize: 13, marginBottom: 4 },
  heroName: {
    color: Colors.text,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: {
    color: Colors.textDim,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  heroPillRow: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(124,58,237,0.1)",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.18)",
  },
  heroPillText: { color: Colors.textMuted, fontSize: 11, fontWeight: "600" },

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
  retryText: { color: "#fff", fontWeight: "700" },
});
