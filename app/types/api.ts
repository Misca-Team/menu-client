export interface ApiResponse<T = any> {
  data: T;
  isSuccess: boolean;
  message?: string;
  messages?: string[];
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Specific Response Types based on observation
export interface AuthToken {
  token: string;
  expireAt: number;
  refreshToken: string;
  refreshTokenExpireAt: number;
}

export interface LoginResponse {
  accessToken: AuthToken;
  fullname: string;
}

export interface UploadResult {
  id: string;
  filePath: string;
}
