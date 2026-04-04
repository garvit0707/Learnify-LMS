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
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post("/api/v1/users/login", payload);
    const { user, accessToken, refreshToken } = data.data;
    await SecureStorage.saveTokens(accessToken, refreshToken);
    await SecureStorage.saveUser(user);
    return { user, accessToken, refreshToken };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post("/api/v1/users/register", payload);
    // After register, auto-login to get token
    const loginRes = await api.post("/api/v1/users/login", {
      email: payload.email,
      password: payload.password,
    });
    const { user, accessToken, refreshToken } = loginRes.data.data;
    await SecureStorage.saveTokens(accessToken, refreshToken);
    await SecureStorage.saveUser(user);
    return { user, accessToken, refreshToken };
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
    return data.data as User;
  },

  async updateAvatar(formData: FormData): Promise<User> {
    const { data } = await api.patch("/api/v1/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as User;
  },
};
