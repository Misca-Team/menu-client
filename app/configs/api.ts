import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosError, 
  InternalAxiosRequestConfig 
} from "axios";
import { refreshSession } from "./refreshToken";
import { ApiResponse } from "../types/api";

// Default config
const axiosConfig: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30s timeout
};

const axiosInstance: AxiosInstance = axios.create(axiosConfig);

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (req: InternalAxiosRequestConfig) => {
    let accessToken = localStorage.getItem("sessionId");

    if (!accessToken) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        // Attempt to refresh token
        try {
          accessToken = await refreshSession(refreshToken);
        } catch (error) {
          // Refresh failed, maybe redirect to login or clear storage?
          console.error("Token refresh failed", error);
        }
      }
    }

    if (accessToken && req.headers) {
      req.headers["Authorization"] = accessToken.startsWith("Bearer ")
        ? accessToken
        : `Bearer ${accessToken}`;
    }

    return req;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Global error handling can be added here (e.g., logging, toast notifications for 500 errors)
    if (error.response?.status === 401) {
      // Handle unauthorized access globally if needed
      // window.location.href = "/auth/login"; 
    }
    return Promise.reject(error);
  }
);

// Typed API Client
const apiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data;
  },

  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
    return response.data;
  },
  
  // Expose raw axios instance if absolutely needed (use sparingly)
  axiosInstance,
};

export default apiClient;
