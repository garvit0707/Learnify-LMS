import CourseCard from "@/components/CourseCard";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Course } from "@/types";
import React, { useCallback } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookmarksScreen() {
  const { getBookmarkedCourses } = useBookmarkStore();
  const bookmarks = getBookmarkedCourses();

  const renderItem = useCallback(
    ({ item }: { item: Course }) => <CourseCard course={item} />,
    [],
  );

  return (
    <SafeAreaView
      className="flex-1 bg-pink-800"
      edges={["top"]}
      // style={{ backgroundColor: "black", flex: 1 }}
    >
      <View className="px-4 pt-4 pb-4">
        <Text className="text-white text-2xl font-bold">Bookmarks</Text>
        <Text className="text-slate-400 text-sm mt-1">
          {bookmarks.length} saved course{bookmarks.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={bookmarks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-24">
            <Text className="text-5xl mb-4">🔖</Text>
            <Text className="text-white text-lg font-bold mb-2">
              No bookmarks yet
            </Text>
            <Text className="text-slate-400 text-sm text-center px-8">
              Tap the bookmark icon on any course to save it here
            </Text>
          </View>
        }
        removeClippedSubviews
        maxToRenderPerBatch={5}
      />
    </SafeAreaView>
  );
}
