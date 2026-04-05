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
  fullName: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const { data } = await api.post("/api/v1/users/login", payload);
      console.log("Login response:", JSON.stringify(data));
      const user = data?.data?.user;
      const accessToken = data?.data?.accessToken;
      const refreshToken = data?.data?.refreshToken;
      if (!accessToken) throw new Error("No access token in response");
      await SecureStorage.saveTokens(accessToken, refreshToken);
      await SecureStorage.saveUser(user);
      return { user, accessToken, refreshToken };
    } catch (err: unknown) {
      console.log("Login error:", JSON.stringify(err));
      throw err;
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const { data } = await api.post("/api/v1/users/register", payload);
      console.log("Register response:", JSON.stringify(data));
      const user = data?.data?.user;
      const accessToken = data?.data?.accessToken;
      const refreshToken = data?.data?.refreshToken;
      if (!accessToken) throw new Error("No access token in response");
      await SecureStorage.saveTokens(accessToken, refreshToken);
      await SecureStorage.saveUser(user);
      return { user, accessToken, refreshToken };
    } catch (err: unknown) {
      console.log("Register error:", err);
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/api/v1/users/logout");
    } finally {
      await SecureStorage.clearAll();
    }
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get("/api/v1/users/current-user");
    return data?.data as User;
  },

  async updateAvatar(formData: FormData): Promise<User> {
    const { data } = await api.patch("/api/v1/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data?.data as User;
  },
};
