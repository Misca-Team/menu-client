import { useState } from "react";
import api from "../configs/api";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/auth/signin-password", {
        username,
        password,
      });

      console.log(res);

      const { token, expireAt, refreshToken, refreshTokenExpireAt } =
        res.data.data.accessToken;
      const fullname = res.data.data.fullname;
      const now = Math.floor(Date.now() / 1000);
      const tokenMaxAge = expireAt - now;
      const refreshTokenMaxAge = refreshTokenExpireAt - now;

      // ذخیره در cookie
      document.cookie = `sessionId=${token}; path=/; max-age=${tokenMaxAge}; SameSite=Lax`;
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${refreshTokenMaxAge}; SameSite=Lax`;

      // ذخیره تو localStorage برای دسترسی راحت در کلاینت
      localStorage.setItem("sessionId", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("fullname", fullname);

      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "خطای ورود رخ داد");
      setLoading(false);
      return false;
    }
  };

  return { login, loading, error };
}
