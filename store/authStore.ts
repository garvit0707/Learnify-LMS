import { authService } from "@/services/authService";
import { User } from "@/types";
import { SecureStorage } from "@/utils/secureStore";
import { create } from "zustand";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // app startup loading
  isSubmitting: boolean; // login/register button loading
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isSubmitting: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStorage.getAccessToken();
      const cachedUser = await SecureStorage.getUser<User>();

      if (token && cachedUser) {
        // Show cached user immediately so app feels instant
        set({ user: cachedUser, isAuthenticated: true, isLoading: false });

        // Silently verify token in background
        try {
          const freshUser = await authService.getCurrentUser();
          await SecureStorage.saveUser(freshUser);
          set({ user: freshUser });
        } catch {
          // Token expired — clear silently
          await SecureStorage.clearAll();
          set({ user: null, isAuthenticated: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const { user } = await authService.login({ email, password });
      set({ user, isAuthenticated: true, isSubmitting: false });
    } catch (err) {
      set({ isSubmitting: false });
      throw err; // Let the screen handle the error toast
    }
  },

  register: async (email: string, username: string, password: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const { user } = await authService.register({
        email,
        username,
        password,
      });
      set({ user, isAuthenticated: true, isSubmitting: false });
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
}));
