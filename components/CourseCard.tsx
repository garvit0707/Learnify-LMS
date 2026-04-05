import { Colors } from "@/constants/colors";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo } from "react";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";

interface Props {
  course: Course;
}

const CourseCard = memo(({ course }: Props) => {
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const bookmarked = isBookmarked(course.id);

  return (
    <Pressable
      onPress={() => router.push(`/course/${course.id}`)}
      className="bg-dark-800 rounded-2xl mx-4 mb-4 overflow-hidden border border-dark-700 active:opacity-80"
    >
      {/* Thumbnail */}
      <View className="relative">
        <Image
          source={{ uri: course.thumbnail }}
          className="w-full h-44"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
        <View className="absolute top-3 left-3 bg-primary-500/90 px-2 py-1 rounded-md">
          <Text className="text-white text-xs font-semibold capitalize">
            {course.category}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => toggleBookmark(course)}
          className="absolute top-3 right-3 bg-dark-900/70 rounded-full p-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={18}
            color={bookmarked ? Colors.primary : Colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Instructor */}
        <View className="flex-row items-center mb-2">
          <Image
            source={{ uri: course.instructorAvatar }}
            className="w-6 h-6 rounded-full"
          />
          <Text className="text-slate-400 text-xs ml-2">
            {course.instructorName}
          </Text>
        </View>

        <Text className="text-white font-bold text-base mb-1" numberOfLines={2}>
          {course.title}
        </Text>
        <Text className="text-slate-400 text-xs mb-3" numberOfLines={2}>
          {course.description}
        </Text>

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="star" size={13} color={Colors.warning} />
            <Text className="text-yellow-400 text-xs ml-1 font-semibold">
              {course.rating?.toFixed(1) || "4.5"}
            </Text>
          </View>
          <Text className="text-primary-500 font-bold text-sm">
            ${course.price}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

CourseCard.displayName = "CourseCard";
export default CourseCard;
