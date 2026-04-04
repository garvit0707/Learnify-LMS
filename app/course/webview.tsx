import { Colors } from "@/constants/colors";
import { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";

const HTML_TEMPLATE = require("@/assets/course-template.html");

export default function CourseWebViewScreen() {
  const { courseData } = useLocalSearchParams<{ courseData: string }>();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const course: Course | null = (() => {
    try {
      return courseData ? JSON.parse(courseData) : null;
    } catch {
      return null;
    }
  })();

  // Inject course data into WebView after load
  const injectCourseData = () => {
    if (!course || !webViewRef.current) return;
    const script = `
      window.receiveNativeData(${JSON.stringify(
        JSON.stringify({
          title: course.title,
          description: course.description,
          category: course.category,
          rating: course.rating,
          price: course.price,
          instructorName: course.instructorName,
          instructorAvatar: course.instructorAvatar,
          isEnrolled: true,
        }),
      )});
      true;
    `;
    webViewRef.current.injectJavaScript(script);
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "USER_INTERACTION") {
        // Handle WebView → Native messages here
        console.log("User interacted with WebView content");
      }
    } catch {
      // ignore
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-dark-700">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 bg-dark-800 rounded-lg items-center justify-center mr-3"
        >
          <Ionicons name="close" size={18} color={Colors.text} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-sm" numberOfLines={1}>
            {course?.title || "Course Content"}
          </Text>
          <Text className="text-slate-400 text-xs">Course Overview</Text>
        </View>
        {!isLoading && !hasError && (
          <TouchableOpacity onPress={handleReload}>
            <Ionicons name="refresh" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* WebView */}
      <View className="flex-1 relative">
        {isLoading && (
          <View className="absolute inset-0 bg-dark-900 items-center justify-center z-10">
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text className="text-slate-400 mt-3 text-sm">
              Loading course content...
            </Text>
          </View>
        )}

        {hasError ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-5xl mb-4">📡</Text>
            <Text className="text-white text-lg font-bold mb-2">
              Content unavailable
            </Text>
            <Text className="text-slate-400 text-sm text-center mb-6">
              Failed to load course content. Please check your connection.
            </Text>
            <TouchableOpacity
              onPress={handleReload}
              className="bg-primary-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Reload</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={HTML_TEMPLATE}
            onLoadEnd={() => {
              setIsLoading(false);
              injectCourseData();
            }}
            onError={handleError}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
            style={{ flex: 1, backgroundColor: "#0F172A" }}
            originWhitelist={["*"]}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
