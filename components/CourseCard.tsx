import { Colors } from "@/constants/colors";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo, useCallback } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BookmarkButton = memo(
  ({ courseId, course }: { courseId: string; course: Course }) => {
    // Select ONLY this course's bookmark state — no other course triggers re-render
    const isBookmarked = useBookmarkStore(
      useCallback((s) => !!s.bookmarks[courseId], [courseId]),
    );
    const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);

    const handlePress = useCallback(() => {
      if (!courseId || courseId === "undefined") return;
      toggleBookmark(course);
    }, [courseId, course, toggleBookmark]);

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
          color={isBookmarked ? Colors.primary : Colors.textMuted}
        />
      </TouchableOpacity>
    );
  },
);

BookmarkButton.displayName = "BookmarkButton";

const CourseCard = memo(
  ({ course }: { course: Course }) => {
    const handlePress = useCallback(() => {
      if (!course.id || course.id === "undefined") return;
      router.push(`/course/${course.id}`);
    }, [course.id]);

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        {/* Thumbnail */}
        <View style={styles.thumbWrap}>
          <Image
            source={{ uri: course.thumbnail }}
            style={styles.thumb}
            resizeMode="cover"
          />
          <View style={styles.thumbOverlay} />

          {/* Top row on image */}
          <View style={styles.thumbTop}>
            <View style={styles.catBadge}>
              <Text style={styles.catText} numberOfLines={1}>
                {course.category}
              </Text>
            </View>
            <BookmarkButton courseId={course.id} course={course} />
          </View>

          {/* Rating pill */}
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={10} color="#FBBF24" />
            <Text style={styles.ratingText}>
              {course.rating?.toFixed(1) || "4.5"}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Instructor */}
          <View style={styles.instructorRow}>
            <Image
              source={{ uri: course.instructorAvatar }}
              style={styles.avatar}
            />
            <Text style={styles.instructorName} numberOfLines={1}>
              {course.instructorName}
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
              <Text style={styles.price}>${course.price}</Text>
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
    prev.course.title === next.course.title,
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
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  thumbWrap: { position: "relative", height: 175 },
  thumb: { width: "100%", height: "100%" },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,15,0.3)",
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
    backgroundColor: "rgba(124,58,237,0.9)",
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
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(10,10,15,0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkActive: {
    backgroundColor: "rgba(124,58,237,0.25)",
    borderColor: "rgba(167,139,250,0.5)",
  },
  ratingPill: {
    position: "absolute",
    bottom: 10,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(10,10,15,0.85)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.25)",
  },
  ratingText: { color: "#FBBF24", fontSize: 10, fontWeight: "700" },
  body: { padding: 14 },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  instructorName: { color: Colors.textMuted, fontSize: 12, flex: 1 },
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
});

export default CourseCard;
