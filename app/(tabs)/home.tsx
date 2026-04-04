import CourseCard from "@/components/CourseCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import OfflineBanner from "@/components/OfflineBanner";
import SearchBar from "@/components/SearchBar";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { useCourseStore } from "@/store/courseStore";
import { Course } from "@/types";
import React, { useCallback, useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const {
    fetchCourses,
    fetchMore,
    isLoading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery,
    getFilteredCourses,
    hasMore,
  } = useCourseStore();

  const { user } = useAuthStore();

  useEffect(() => {
    fetchCourses();
  }, []);

  const courses = getFilteredCourses();

  const renderItem = useCallback(
    ({ item }: { item: Course }) => <CourseCard course={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  const renderFooter = () => {
    if (!hasMore) return null;
    if (isLoading && courses.length > 0) {
      return (
        <View className="py-4">
          <ActivityIndicator color={Colors.primary} />
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => {
    if (isLoading && courses.length === 0) {
      return <LoadingSpinner fullScreen message="Loading courses..." />;
    }
    if (error) {
      return (
        <View className="flex-1 items-center justify-center px-8 py-20">
          <Text className="text-5xl mb-4">😕</Text>
          <Text className="text-white text-lg font-bold mb-2">
            Failed to load
          </Text>
          <Text className="text-slate-400 text-sm text-center mb-6">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchCourses()}
            className="bg-primary-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (searchQuery && courses.length === 0) {
      return (
        <View className="items-center py-20">
          <Text className="text-5xl mb-3">🔍</Text>
          <Text className="text-slate-400 text-sm">
            No courses match "{searchQuery}"
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900" edges={["top"]}>
      <OfflineBanner />

      {/* Header */}
      <View className="px-4 pt-4 pb-3">
        <Text className="text-slate-400 text-sm">
          Hello, {user?.fullName?.split(" ")[0] || user?.username || "Learner"}{" "}
          👋
        </Text>
        <Text className="text-white text-2xl font-bold mt-0.5">
          What do you want to learn?
        </Text>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <FlatList
        data={courses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchCourses(true)}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        removeClippedSubviews
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        getItemLayout={(_, index) => ({
          length: 300,
          offset: 300 * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}
