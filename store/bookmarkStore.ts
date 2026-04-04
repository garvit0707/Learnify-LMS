import { Course } from "@/types";
import {
    requestNotificationPermissions,
    scheduleBookmarkMilestoneNotification,
} from "@/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const BOOKMARKS_KEY = "learnify_bookmarks";
const ENROLLED_KEY = "learnify_enrolled";
const MILESTONE_NOTIFIED_KEY = "learnify_milestone_notified";

interface BookmarkStore {
  bookmarks: Record<string, Course>;
  enrolled: Record<string, boolean>;
  isLoaded: boolean;

  loadFromStorage: () => Promise<void>;
  toggleBookmark: (course: Course) => Promise<void>;
  isBookmarked: (id: string) => boolean;
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
      const [bookmarksRaw, enrolledRaw] = await Promise.all([
        AsyncStorage.getItem(BOOKMARKS_KEY),
        AsyncStorage.getItem(ENROLLED_KEY),
      ]);
      set({
        bookmarks: bookmarksRaw ? JSON.parse(bookmarksRaw) : {},
        enrolled: enrolledRaw ? JSON.parse(enrolledRaw) : {},
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  toggleBookmark: async (course) => {
    const { bookmarks } = get();
    const isCurrentlyBookmarked = !!bookmarks[course.id];
    let updated: Record<string, Course>;

    if (isCurrentlyBookmarked) {
      updated = { ...bookmarks };
      delete updated[course.id];
    } else {
      updated = { ...bookmarks, [course.id]: course };
    }

    set({ bookmarks: updated });
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));

    // Check milestone: 5+ bookmarks
    const count = Object.keys(updated).length;
    if (count >= 5) {
      const alreadyNotified = await AsyncStorage.getItem(
        MILESTONE_NOTIFIED_KEY,
      );
      if (!alreadyNotified) {
        const granted = await requestNotificationPermissions();
        if (granted) {
          await scheduleBookmarkMilestoneNotification();
          await AsyncStorage.setItem(MILESTONE_NOTIFIED_KEY, "true");
        }
      }
    }
  },

  isBookmarked: (id) => !!get().bookmarks[id],

  enrollCourse: async (id) => {
    const updated = { ...get().enrolled, [id]: true };
    set({ enrolled: updated });
    await AsyncStorage.setItem(ENROLLED_KEY, JSON.stringify(updated));
  },

  isEnrolled: (id) => !!get().enrolled[id],

  getBookmarkedCourses: () => Object.values(get().bookmarks),
}));
