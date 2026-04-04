import { courseService } from "@/services/courseService";
import { Course } from "@/types";
import { create } from "zustand";

interface CourseStore {
  courses: Course[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  searchQuery: string;
  fetchCourses: (refresh?: boolean) => Promise<void>;
  fetchMore: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  getFilteredCourses: () => Course[];
  updateCourse: (id: string, updates: Partial<Course>) => void;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  courses: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  page: 1,
  hasMore: true,
  searchQuery: "",

  fetchCourses: async (refresh = false) => {
    const { isLoading } = get();
    if (isLoading && !refresh) return;
    set(
      refresh
        ? { isRefreshing: true, error: null }
        : { isLoading: true, error: null },
    );
    try {
      const newCourses = await courseService.fetchCourses(1, 10);
      // Deduplicate by id — prevents duplicate key warnings
      const seen = new Set<string>();
      const unique = newCourses.filter((c) => {
        if (!c.id || seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
      set({ courses: unique, page: 1, hasMore: unique.length >= 10 });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to load courses",
      });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  fetchMore: async () => {
    const { isLoading, page, hasMore, courses } = get();
    if (isLoading || !hasMore) return;
    set({ isLoading: true });
    try {
      const nextPage = page + 1;
      const newCourses = await courseService.fetchCourses(nextPage, 10);
      const existingIds = new Set(courses.map((c) => c.id));
      const unique = newCourses.filter((c) => c.id && !existingIds.has(c.id));
      set({
        courses: [...courses, ...unique],
        page: nextPage,
        hasMore: newCourses.length >= 10,
      });
    } catch {
      // silent
    } finally {
      set({ isLoading: false });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredCourses: () => {
    const { courses, searchQuery } = get();
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  },

  updateCourse: (id, updates) =>
    set((s) => ({
      courses: s.courses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
}));
