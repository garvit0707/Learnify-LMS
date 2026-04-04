import * as SecureStore from "expo-secure-store";

const KEYS = {
  ACCESS_TOKEN: "learnify_access_token",
  REFRESH_TOKEN: "learnify_refresh_token",
  USER_DATA: "learnify_user_data",
} as const;

export const SecureStorage = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
  },

  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },

  async saveUser(user: object): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(user));
  },

  async getUser<T>(): Promise<T | null> {
    const raw = await SecureStore.getItemAsync(KEYS.USER_DATA);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async clearAll(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.USER_DATA);
  },
};
