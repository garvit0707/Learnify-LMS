import AppModal from "@/components/Modal";
import { Colors } from "@/constants/colors";
import { courseService } from "@/services/courseService";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const CURRICULUM = [
  { title: "Introduction & Course Overview", duration: "12 min", free: true },
  { title: "Setting Up Your Environment", duration: "18 min", free: true },
  { title: "Core Concepts Deep Dive", duration: "34 min", free: false },
  { title: "Hands-On Project Walkthrough", duration: "45 min", free: false },
  { title: "Advanced Patterns & Techniques", duration: "38 min", free: false },
  { title: "Testing & Best Practices", duration: "26 min", free: false },
  { title: "Deployment & Production", duration: "22 min", free: false },
  { title: "Final Project & Assessment", duration: "50 min", free: false },
];

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollModal, setEnrollModal] = useState(false);

  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);
  const enrollCourse = useBookmarkStore((s) => s.enrollCourse);
  const isEnrolled = useBookmarkStore((s) => s.isEnrolled);

  const isBookmarked = course ? !!bookmarks[course.id] : false;
  const enrolled = course ? isEnrolled(course.id) : false;

  useEffect(() => {
    if (id) loadCourse();
  }, [id]);

  const loadCourse = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await courseService.fetchCourseById(id!);
      if (!data) throw new Error("Course not found");
      setCourse(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = useCallback(() => {
    if (!course) return;
    toggleBookmark(course);
  }, [course, toggleBookmark]);

  const handleEnroll = useCallback(() => {
    if (!course) return;
    if (enrolled) {
      router.push({
        pathname: "/course/webview",
        params: { courseData: JSON.stringify(course) },
      });
      return;
    }
    setEnrollModal(true);
  }, [course, enrolled]);

  const doEnroll = useCallback(async () => {
    if (!course) return;
    setEnrolling(true);
    await enrollCourse(course.id);
    setEnrolling(false);
    Toast.show({ type: "success", text1: "🎉 Enrolled!", text2: course.title });
  }, [course, enrollCourse]);

  if (isLoading)
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading course...</Text>
        </View>
      </SafeAreaView>
    );

  if (error || !course)
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
          <Text style={styles.errorTitle}>Course not found</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadCourse}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 16 }}
          >
            <Text style={{ color: Colors.textMuted }}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );

  const completedLessons = enrolled ? 2 : 0;
  const progress = (completedLessons / CURRICULUM.length) * 100;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Course Detail
        </Text>
        <TouchableOpacity
          onPress={handleBookmark}
          style={[styles.headerBtn, isBookmarked && styles.headerBtnActive]}
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isBookmarked ? Colors.primary : Colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: course.thumbnail }}
            style={styles.hero}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroBadges}>
            <View style={styles.catPill}>
              <Text style={styles.catPillText}>{course.category}</Text>
            </View>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>{course.rating?.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{course.title}</Text>

          <View style={styles.statsRow}>
            {[
              {
                icon: "people-outline",
                val: `${Math.floor(course.stock * 12 + 500)}`,
                label: "Students",
              },
              { icon: "time-outline", val: "4.5h", label: "Duration" },
              { icon: "bar-chart-outline", val: "All levels", label: "Level" },
              { icon: "ribbon-outline", val: "Cert", label: "Included" },
            ].map((s) => (
              <View key={s.label} style={styles.statBox}>
                <Ionicons
                  name={s.icon as any}
                  size={18}
                  color={Colors.primary}
                />
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.instructorCard}>
            <Image
              source={{ uri: course.instructorAvatar }}
              style={styles.instructorAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.instructorLabel}>Your Instructor</Text>
              <Text style={styles.instructorName}>{course.instructorName}</Text>
              <View style={styles.instructorMeta}>
                <Ionicons name="star" size={11} color="#FBBF24" />
                <Text style={styles.instructorRating}>4.9 · 12k Students</Text>
              </View>
            </View>
            <View style={styles.followBtn}>
              <Text style={styles.followText}>Follow</Text>
            </View>
          </View>

          {enrolled && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Your Progress</Text>
                <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressSub}>
                {completedLessons} of {CURRICULUM.length} lessons done
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Course</Text>
            <Text style={styles.description}>{course.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Learn</Text>
            <View style={styles.learnGrid}>
              {[
                "Core fundamentals",
                "Real-world projects",
                "Best practices",
                "Testing skills",
                "Performance tips",
                "Production deploy",
              ].map((item) => (
                <View key={item} style={styles.learnItem}>
                  <View style={styles.checkCircle}>
                    <Ionicons
                      name="checkmark"
                      size={11}
                      color={Colors.primary}
                    />
                  </View>
                  <Text style={styles.learnText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Curriculum</Text>
            <Text style={styles.curriculumMeta}>
              {CURRICULUM.length} lessons ·{" "}
              {enrolled ? "Full access" : "2 free previews"}
            </Text>
            {CURRICULUM.map((lesson, i) => (
              <View
                key={lesson.title}
                style={[
                  styles.lessonRow,
                  i === CURRICULUM.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View
                  style={[
                    styles.lessonNum,
                    enrolled && i < completedLessons && styles.lessonNumDone,
                  ]}
                >
                  {enrolled && i < completedLessons ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : (
                    <Text style={styles.lessonNumText}>{i + 1}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.lessonTitle,
                      !enrolled && !lesson.free && styles.lessonLocked,
                    ]}
                  >
                    {lesson.title}
                  </Text>
                  <Text style={styles.lessonDur}>{lesson.duration}</Text>
                </View>
                {lesson.free && !enrolled ? (
                  <View style={styles.freePill}>
                    <Text style={styles.freePillText}>Free</Text>
                  </View>
                ) : (
                  !enrolled && (
                    <Ionicons
                      name="lock-closed-outline"
                      size={14}
                      color={Colors.textDim}
                    />
                  )
                )}
              </View>
            ))}
          </View>

          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>Course Price</Text>
              <Text style={styles.price}>${course.price}</Text>
            </View>
            <View style={styles.stockBadge}>
              <Ionicons name="people" size={13} color={Colors.success} />
              <Text style={styles.stockText}>{course.stock} seats left</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <TouchableOpacity
          style={[styles.ctaPrimary, enrolling && { opacity: 0.7 }]}
          onPress={handleEnroll}
          activeOpacity={0.85}
          disabled={enrolling}
        >
          {enrolling ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons
                name={enrolled ? "play-circle" : "rocket-outline"}
                size={18}
                color="#fff"
              />
              <Text style={styles.ctaPrimaryText}>
                {enrolled ? "Continue Learning" : "Enroll Now — Free"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <AppModal
        visible={enrollModal}
        onClose={() => setEnrollModal(false)}
        icon="rocket-outline"
        iconColor={Colors.primary}
        title="Enroll in Course"
        message={`Start learning "${course.title}"? You'll get full access to all ${CURRICULUM.length} lessons instantly.`}
        actions={[
          { label: "Enroll Free", variant: "primary", onPress: doEnroll },
          { label: "Maybe Later", variant: "ghost", onPress: () => {} },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: { color: Colors.textMuted, marginTop: 12, fontSize: 14 },
  errorTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorMsg: { color: Colors.textMuted, textAlign: "center", marginBottom: 24 },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnActive: {
    backgroundColor: "rgba(124,58,237,0.15)",
    borderColor: "rgba(124,58,237,0.4)",
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  heroWrap: { position: "relative", height: 240 },
  hero: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,15,0.4)",
  },
  heroBadges: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 8,
  },
  catPill: {
    backgroundColor: "rgba(124,58,237,0.85)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.4)",
  },
  catPillText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(10,10,15,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.25)",
  },
  ratingText: { color: "#FBBF24", fontSize: 12, fontWeight: "700" },
  content: { padding: 20 },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 20,
  },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statVal: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  statLabel: { color: Colors.textDim, fontSize: 10 },
  instructorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 20,
  },
  instructorAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  instructorLabel: { color: Colors.textDim, fontSize: 11, marginBottom: 2 },
  instructorName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  instructorMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  instructorRating: { color: Colors.textMuted, fontSize: 12 },
  followBtn: {
    backgroundColor: "rgba(124,58,237,0.12)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.3)",
  },
  followText: { color: Colors.primary, fontSize: 12, fontWeight: "700" },
  progressCard: {
    backgroundColor: "rgba(124,58,237,0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.3)",
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressTitle: { color: Colors.text, fontWeight: "700" },
  progressPct: { color: Colors.primary, fontWeight: "700" },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressSub: { color: Colors.textMuted, fontSize: 12 },
  section: { marginBottom: 24 },
  sectionTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  description: { color: Colors.textMuted, fontSize: 14, lineHeight: 22 },
  learnGrid: { gap: 10 },
  learnItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(124,58,237,0.15)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  learnText: { color: Colors.textMuted, fontSize: 14, flex: 1, lineHeight: 20 },
  curriculumMeta: { color: Colors.textDim, fontSize: 13, marginBottom: 12 },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  lessonNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonNumDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  lessonNumText: { color: Colors.textMuted, fontSize: 12, fontWeight: "700" },
  lessonTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  lessonLocked: { color: Colors.textDim },
  lessonDur: { color: Colors.textDim, fontSize: 11 },
  freePill: {
    backgroundColor: "rgba(16,185,129,0.12)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  freePillText: { color: Colors.success, fontSize: 10, fontWeight: "700" },
  priceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 8,
  },
  priceLabel: { color: Colors.textDim, fontSize: 11, marginBottom: 2 },
  price: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16,185,129,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.25)",
  },
  stockText: { color: Colors.success, fontSize: 12, fontWeight: "600" },
  ctaBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  ctaPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  ctaPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
});
