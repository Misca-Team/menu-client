import api from "../configs/api";

import { LoginResponse } from "../types/api";

export const refreshSession = async (
  refreshToken: string
): Promise<string | null> => {
  try {
    const res = await api.post<LoginResponse>("/auth/refresh-token", { refreshToken });
    const {
      token,
      expireAt,
      refreshToken: newRefreshToken,
      refreshTokenExpireAt,
    } = res.data.accessToken;

    const now = Math.floor(Date.now() / 1000);
    const tokenMaxAge = expireAt - now;
    const refreshTokenMaxAge = refreshTokenExpireAt - now;

    document.cookie = `sessionId=${token}; path=/; max-age=${tokenMaxAge}; SameSite=Lax`;
    document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=${refreshTokenMaxAge}; SameSite=Lax`;

    localStorage.setItem("sessionId", token);
    localStorage.setItem("refreshToken", newRefreshToken);

    return token;
  } catch (err) {
    console.error("Error refreshing session:", err);
    return null;
  }
};
