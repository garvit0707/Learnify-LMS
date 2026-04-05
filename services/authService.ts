import { User } from "@/types";
import { SecureStorage } from "@/utils/secureStore";
import api from "./api";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  role?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== "object") return fallback;
  const e = err as Record<string, any>;

  // Axios error with response body
  const apiMsg =
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.response?.data?.errors?.[0]?.message ||
    e?.response?.data?.errors?.[0];

  if (apiMsg && typeof apiMsg === "string") return apiMsg;

  // Network / timeout error
  if (e?.message && typeof e.message === "string") {
    if (e.message.includes("Network Error"))
      return "No internet connection. Please check your network.";
    if (e.message.includes("timeout"))
      return "Request timed out. Please try again.";
    return e.message;
  }

  return fallback;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post("/api/v1/users/login", {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });

    const { user, accessToken, refreshToken } = data.data;
    if (!accessToken) throw new Error("Login failed: no token received");

    await SecureStorage.saveTokens(accessToken, refreshToken);
    await SecureStorage.saveUser(user);
    return { user, accessToken, refreshToken };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    // Step 1: Register
    await api.post("/api/v1/users/register", {
      email: payload.email.trim().toLowerCase(),
      username: payload.username.trim().toLowerCase(),
      password: payload.password,
      role: payload.role || "USER",
    });

    // Step 2: Auto-login after registration (register doesn't return a token)
    const { data } = await api.post("/api/v1/users/login", {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });

    const { user, accessToken, refreshToken } = data.data;
    if (!accessToken)
      throw new Error("Registration succeeded but login failed");

    await SecureStorage.saveTokens(accessToken, refreshToken);
    await SecureStorage.saveUser(user);
    return { user, accessToken, refreshToken };
  },

  async logout(): Promise<void> {
    try {
      await api.post("/api/v1/users/logout");
    } catch {
      // Ignore logout API errors — always clear local storage
    } finally {
      await SecureStorage.clearAll();
    }
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get("/api/v1/users/current-user");
    if (!data?.data) throw new Error("Could not fetch user profile");
    return data.data as User;
  },

  async updateAvatar(formData: FormData): Promise<User> {
    const { data } = await api.patch("/api/v1/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as User;
  },
};
