import { Course } from "@/types";
import {
  requestNotificationPermissions,
  scheduleBookmarkMilestoneNotification,
} from "@/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const BOOKMARKS_KEY = "learnify_bookmarks";
const ENROLLED_KEY = "learnify_enrolled";
const MILESTONE_KEY = "learnify_milestone_notified";

interface BookmarkStore {
  bookmarks: Record<string, Course>;
  enrolled: Record<string, boolean>;
  isLoaded: boolean;
  loadFromStorage: () => Promise<void>;
  toggleBookmark: (course: Course) => Promise<void>;
  enrollCourse: (id: string) => Promise<void>;
  isEnrolled: (id: string) => boolean;
  getBookmarkedCourses: () => Course[];
}

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: {},
  enrolled: {},
  isLoaded: false,

  loadFromStorage: async () => {
    try {
      const [b, e] = await Promise.all([
        AsyncStorage.getItem(BOOKMARKS_KEY),
        AsyncStorage.getItem(ENROLLED_KEY),
      ]);
      set({
        bookmarks: b ? JSON.parse(b) : {},
        enrolled: e ? JSON.parse(e) : {},
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  toggleBookmark: async (course: Course) => {
    // Guard: never allow undefined id
    if (!course?.id || course.id === "undefined") {
      console.warn("toggleBookmark called with invalid course id", course);
      return;
    }

    const prev = get().bookmarks;
    const wasBookmarked = !!prev[course.id];
    const next = { ...prev };

    if (wasBookmarked) {
      delete next[course.id];
    } else {
      next[course.id] = { ...course };
    }

    // Optimistic update
    set({ bookmarks: next });

    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    } catch {
      // Rollback
      set({ bookmarks: prev });
      return;
    }

    // Milestone: exactly 5 bookmarks
    if (!wasBookmarked && Object.keys(next).length === 5) {
      const done = await AsyncStorage.getItem(MILESTONE_KEY);
      if (!done) {
        const ok = await requestNotificationPermissions();
        if (ok) {
          await scheduleBookmarkMilestoneNotification();
          await AsyncStorage.setItem(MILESTONE_KEY, "true");
        }
      }
    }
  },

  enrollCourse: async (id: string) => {
    if (!id || id === "undefined") return;
    const updated = { ...get().enrolled, [id]: true };
    set({ enrolled: updated });
    await AsyncStorage.setItem(ENROLLED_KEY, JSON.stringify(updated));
  },

  isEnrolled: (id: string) => !!get().enrolled[id],
  getBookmarkedCourses: () => Object.values(get().bookmarks),
}));
