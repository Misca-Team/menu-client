import { useState } from "react";
import Cookies from "js-cookie";
import apiClient from "../configs/api";
import { AxiosError } from "axios";
import { LoginResponse } from "../types/api";

interface LoginCredentials {
  username: string;
  password: string;
}

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function useLogin(): UseLoginReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async ({ username, password }: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // apiClient.post now returns Promise<ApiResponse<LoginResponse>>
      // The response structure from server is wrapped in ApiResponse
      const res = await apiClient.post<LoginResponse>("/auth/signin-password", {
        username,
        password,
      });

      // Based on previous code, the data structure was res.data.data.accessToken
      // Now apiClient returns res.data which is of type ApiResponse<LoginResponse>
      // So 'res' is ApiResponse<LoginResponse>
      // And 'res.data' is LoginResponse
      
      const { accessToken, fullname } = res.data;
      const { token, expireAt, refreshToken, refreshTokenExpireAt } = accessToken;
      
      const tokenExpiresDate = new Date(expireAt * 1000);
      const refreshTokenExpiresDate = new Date(refreshTokenExpireAt * 1000);

      Cookies.set("sessionId", token, { 
        expires: tokenExpiresDate,
        path: "/",
        sameSite: "Lax" 
      });
      
      Cookies.set("refreshToken", refreshToken, { 
        expires: refreshTokenExpiresDate,
        path: "/",
        sameSite: "Lax" 
      });

      // Save to localStorage for client-side access
      localStorage.setItem("sessionId", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("fullname", fullname);

      setLoading(false);
      return true;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = 
        axiosError.response?.data?.message || 
        "خطای ورود رخ داد. لطفا مجددا تلاش کنید.";
      
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  return { login, loading, error };
}
