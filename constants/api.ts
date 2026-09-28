export const API_BASE_URL = "https://api.freeapi.app";
export const API_TIMEOUT = 15000;
export const API_MAX_RETRIES = 3;

export const API_ENDPOINTS = {
  login: "/api/v1/users/login",
  register: "/api/v1/users/register",
  logout: "/api/v1/users/logout",
  refreshToken: "/api/v1/users/refresh-token",
  currentUser: "/api/v1/users/current-user",
  avatar: "/api/v1/users/avatar",
  randomProducts: "/api/v1/public/randomproducts",
  randomUsers: "/api/v1/public/randomusers",
} as const;
