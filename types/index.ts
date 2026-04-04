export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: {
    url: string;
    localPath: string;
  };
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  stock: number;
  rating: number;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  isBookmarked?: boolean;
  isEnrolled?: boolean;
}

export interface RawProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  stock: number;
  rating: number;
}

export interface RandomUser {
  login: { uuid: string };
  name: { first: string; last: string };
  picture: { medium: string; large: string };
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: {
    data: T[];
    page: number;
    limit: number;
    totalPages: number;
    previousPage: boolean;
    nextPage: boolean;
    serialNumberStartFrom: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    totalItems: number;
  };
  message: string;
  statusCode: number;
  success: boolean;
}
