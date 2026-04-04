import { Colors } from "@/constants/colors";
import { courseService } from "@/services/courseService";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isBookmarked, toggleBookmark, isEnrolled, enrollCourse } =
    useBookmarkStore();

  const bookmarked = course ? isBookmarked(course.id) : false;
  const enrolled = course ? isEnrolled(course.id) : false;

  useEffect(() => {
    if (!id) return;
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await courseService.fetchCourseById(id!);
      if (!data) throw new Error("Course not found");
      setCourse(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load course");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = useCallback(async () => {
    if (!course) return;
    if (enrolled) {
      router.push({
        pathname: "/course/webview",
        params: {
          courseData: JSON.stringify(course),
        },
      });
      return;
    }

    Alert.alert(
      "Enroll in Course",
      `Do you want to enroll in "${course.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Enroll",
          onPress: async () => {
            await enrollCourse(course.id);
            Toast.show({
              type: "success",
              text1: "🎉 Enrolled!",
              text2: `You're now enrolled in ${course.title}`,
            });
          },
        },
      ],
    );
  }, [course, enrolled]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-900 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView className="flex-1 bg-dark-900 items-center justify-center px-6">
        <Text className="text-5xl mb-4">😕</Text>
        <Text className="text-white text-lg font-bold mb-2">
          Course not found
        </Text>
        <Text className="text-slate-400 text-sm text-center mb-6">{error}</Text>
        <TouchableOpacity
          onPress={loadCourse}
          className="bg-primary-500 px-6 py-3 rounded-xl mr-3"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="mt-3">
          <Text className="text-slate-400">← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-900" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-dark-800 rounded-xl items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => course && toggleBookmark(course)}
          className="w-10 h-10 bg-dark-800 rounded-xl items-center justify-center"
        >
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={bookmarked ? Colors.primary : Colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        <Image
          source={{ uri: course.thumbnail }}
          className="w-full h-52"
          resizeMode="cover"
        />

        <View className="px-4 pt-5 pb-8">
          {/* Category & Rating */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="bg-primary-500/20 px-3 py-1 rounded-full">
              <Text className="text-primary-500 text-xs font-semibold capitalize">
                {course.category}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color={Colors.warning} />
              <Text className="text-yellow-400 text-xs ml-1 font-bold">
                {course.rating?.toFixed(1)}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-white text-2xl font-bold mb-3 leading-tight">
            {course.title}
          </Text>

          {/* Instructor */}
          <View className="flex-row items-center mb-4 bg-dark-800 rounded-2xl p-3 border border-dark-700">
            <Image
              source={{ uri: course.instructorAvatar }}
              className="w-12 h-12 rounded-full"
            />
            <View className="ml-3">
              <Text className="text-slate-400 text-xs">Instructor</Text>
              <Text className="text-white font-semibold text-sm">
                {course.instructorName}
              </Text>
            </View>
          </View>

          {/* Price & Stock */}
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1 bg-dark-800 rounded-xl p-3 border border-dark-700 items-center">
              <Text className="text-primary-500 text-xl font-bold">
                ${course.price}
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">Price</Text>
            </View>
            <View className="flex-1 bg-dark-800 rounded-xl p-3 border border-dark-700 items-center">
              <Text className="text-green-400 text-xl font-bold">
                {course.stock}
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">Seats Left</Text>
            </View>
          </View>

          {/* Description */}
          <Text className="text-slate-300 text-sm font-semibold mb-2 uppercase tracking-wide">
            About this course
          </Text>
          <Text className="text-slate-400 text-sm leading-relaxed mb-6">
            {course.description}
          </Text>

          {/* View Content Button */}
          {enrolled && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/course/webview",
                  params: { courseData: JSON.stringify(course) },
                })
              }
              className="bg-dark-700 border border-primary-500/40 rounded-2xl py-4 items-center mb-3"
            >
              <Text className="text-primary-500 font-bold text-base">
                📖 View Course Content
              </Text>
            </TouchableOpacity>
          )}

          {/* Enroll Button */}
          <TouchableOpacity
            onPress={handleEnroll}
            className="bg-primary-500 rounded-2xl py-4 items-center active:opacity-80"
          >
            <Text className="text-white font-bold text-base">
              {enrolled ? "✅ Enrolled — Start Learning" : "Enroll Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
