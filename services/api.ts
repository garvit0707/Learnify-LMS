import { SecureStorage } from "@/utils/secureStore";
import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";

const BASE_URL = "https://api.freeapi.app";
const TIMEOUT = 15000;
const MAX_RETRIES = 3;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 + retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Token refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStorage.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${BASE_URL}/api/v1/users/refresh-token`,
          { refreshToken },
        );
        const newToken = data?.data?.accessToken;
        if (newToken) {
          await SecureStorage.saveTokens(
            newToken,
            data?.data?.refreshToken || refreshToken,
          );
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch {
        await SecureStorage.clearAll();
        router.replace("/(auth)/login");
        return Promise.reject(error);
      }
    }

    // Retry logic for network errors
    if (!error.response) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      if (originalRequest._retryCount <= MAX_RETRIES) {
        await new Promise((res) =>
          setTimeout(res, 1000 * originalRequest._retryCount!),
        );
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
