import { Colors } from "@/constants/colors";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
<<<<<<< Updated upstream
import React, { memo } from "react";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";

interface Props {
  course: Course;
}
=======
import React, { memo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BookmarkButton = memo(
  ({ courseId, course }: { courseId: string; course: Course }) => {
    const isBookmarked = useBookmarkStore(
      useCallback((s) => !!s.bookmarks[courseId], [courseId]),
    );
    const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);
>>>>>>> Stashed changes

const CourseCard = memo(({ course }: Props) => {
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const bookmarked = isBookmarked(course.id);

<<<<<<< Updated upstream
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
=======
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[styles.bookmarkBtn, isBookmarked && styles.bookmarkActive]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isBookmarked ? "bookmark" : "bookmark-outline"}
          size={15}
          color={isBookmarked ? Colors.primary : Colors.white}
        />
      </TouchableOpacity>
    );
  },
);
BookmarkButton.displayName = "BookmarkButton";

const CourseCard = memo(
  ({ course }: { course: Course }) => {
    const [imgLoading, setImgLoading] = useState(true);
    const [imgError, setImgError] = useState(false);

    const handlePress = useCallback(() => {
      if (!course.id || course.id === "undefined") return;
      router.push(`/course/${course.id}`);
    }, [course.id]);

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        {/* ── Thumbnail ── */}
        <View style={styles.thumbWrap}>
          {/* Placeholder shown while loading */}
          {imgLoading && !imgError && (
            <View style={styles.imgPlaceholder}>
              <ActivityIndicator color={Colors.primary} size="small" />
            </View>
          )}

          {/* Error fallback */}
          {imgError && (
            <View style={styles.imgError}>
              <Text style={{ fontSize: 40 }}>📚</Text>
              <Text style={styles.imgErrorText}>{course.category}</Text>
            </View>
          )}

          {!imgError && (
            <Image
              source={{ uri: course.thumbnail }}
              style={[styles.thumb, imgLoading && { opacity: 0 }]}
              resizeMode="cover"
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setImgError(true);
                setImgLoading(false);
              }}
            />
          )}

          {/* Dark overlay */}
          <View style={styles.thumbOverlay} />

          {/* Top row */}
          <View style={styles.thumbTop}>
            <View style={styles.catBadge}>
              <Text style={styles.catText} numberOfLines={1}>
                {course.category}
              </Text>
            </View>
            <BookmarkButton courseId={course.id} course={course} />
          </View>

          {/* Bottom row */}
          <View style={styles.thumbBottom}>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={10} color="#FBBF24" />
              <Text style={styles.ratingText}>
                {typeof course.rating === "number"
                  ? course.rating.toFixed(1)
                  : "4.5"}
              </Text>
            </View>
            <View style={styles.stockPill}>
              <Ionicons
                name="people-outline"
                size={10}
                color={Colors.textMuted}
              />
              <Text style={styles.stockText}>{course.stock} seats</Text>
            </View>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>
          {/* Instructor */}
          <View style={styles.instructorRow}>
            <Image
              source={{ uri: course.instructorAvatar }}
              style={styles.avatar}
              defaultSource={{
                uri: `https://api.dicebear.com/7.x/avataaars/png?seed=default`,
              }}
            />
            <Text style={styles.instructorName} numberOfLines={1}>
              {course.instructorName}
            </Text>
            <View style={styles.dot} />
            <Text style={styles.categoryLabel} numberOfLines={1}>
              {course.category}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {course.title}
          </Text>

          {/* Description */}
          <Text style={styles.desc} numberOfLines={2}>
            {course.description}
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Footer */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.priceLabel}>PRICE</Text>
              <Text style={styles.price}>
                {course.price === 0 ? "Free" : `$${course.price}`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaText}>Explore</Text>
              <Ionicons name="arrow-forward" size={12} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  },
  (prev, next) =>
    prev.course.id === next.course.id &&
    prev.course.thumbnail === next.course.thumbnail,
);
CourseCard.displayName = "CourseCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: "hidden",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },

  // Thumbnail
  thumbWrap: {
    position: "relative",
    height: 180,
    backgroundColor: Colors.surfaceElevated,
  },
  thumb: { width: "100%", height: "100%" },
  imgPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  imgError: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imgErrorText: {
    color: Colors.textDim,
    fontSize: 12,
    textTransform: "capitalize",
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,15,0.25)",
  },
  thumbTop: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  catBadge: {
    backgroundColor: "rgba(124,58,237,0.88)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.4)",
    maxWidth: 140,
  },
  catText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  bookmarkBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(10,10,15,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkActive: {
    backgroundColor: "rgba(124,58,237,0.3)",
    borderColor: "rgba(167,139,250,0.6)",
  },
  thumbBottom: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(10,10,15,0.82)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.2)",
  },
  ratingText: { color: "#FBBF24", fontSize: 10, fontWeight: "700" },
  stockPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(10,10,15,0.82)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  stockText: { color: Colors.textMuted, fontSize: 10 },

  // Body
  body: { padding: 14 },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
  },
  instructorName: { color: Colors.textMuted, fontSize: 12, flex: 1 },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textDim,
  },
  categoryLabel: {
    color: Colors.textDim,
    fontSize: 11,
    textTransform: "capitalize",
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  desc: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    color: Colors.textDim,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  price: {
    color: Colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  ctaText: { color: "#fff", fontSize: 12, fontWeight: "700" },
>>>>>>> Stashed changes
});

CourseCard.displayName = "CourseCard";
export default CourseCard;
