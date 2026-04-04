import { authService } from "@/services/authService";
import { User } from "@/types";
import { SecureStorage } from "@/utils/secureStore";
import { create } from "zustand";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    fullName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStorage.getAccessToken();
      const cachedUser = await SecureStorage.getUser<User>();
      if (token && cachedUser) {
        set({ user: cachedUser, isAuthenticated: true });
        try {
          const freshUser = await authService.getCurrentUser();
          await SecureStorage.saveUser(freshUser);
          set({ user: freshUser, isAuthenticated: true });
        } catch {
          await SecureStorage.clearAll();
          set({ user: null, isAuthenticated: false });
        }
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login({ email, password });
      set({ user, isAuthenticated: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, username, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.register({
        email,
        username,
        password,
        fullName,
      });
      set({ user, isAuthenticated: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
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
