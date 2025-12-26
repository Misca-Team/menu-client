import { useState } from "react";
import Cookies from "js-cookie";
import api from "../configs/api";
import { AxiosError } from "axios";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponseData {
  data: {
    accessToken: {
      token: string;
      expireAt: number;
      refreshToken: string;
      refreshTokenExpireAt: number;
    };
    fullname: string;
  };
  message?: string;
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
      const res = await api.post<LoginResponseData>("/auth/signin-password", {
        username,
        password,
      });

      const { token, expireAt, refreshToken, refreshTokenExpireAt } =
        res.data.data.accessToken;
      const fullname = res.data.data.fullname;
      
      const now = Math.floor(Date.now() / 1000);
      
      // Calculate max-age in days for js-cookie (it expects days, or strict options)
      // Actually js-cookie 'expires' option can take days (number) or Date object.
      // But standard cookie max-age is in seconds. js-cookie doesn't support max-age directly in the simplified API, 
      // it uses 'expires' which sets Expires header.
      // However, the previous code used document.cookie with max-age. 
      // Let's stick to document.cookie or use js-cookie properly.
      // If we use js-cookie: Cookies.set('name', 'value', { expires: 7 }) -> 7 days.
      // We have specific expiration times.
      
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

      // Save to localStorage for client-side access (as per original code)
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
