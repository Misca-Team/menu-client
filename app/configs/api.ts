import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

type TokenRefreshCallback = (token: string) => void;

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing: boolean = false;
let refreshSubscribers: TokenRefreshCallback[] = [];

const subscribeTokenRefresh = (cb: TokenRefreshCallback): void => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string): void => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.request.use(
  (req: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window !== "undefined") {
      const accessToken: string | null = localStorage.getItem("sessionId");

      if (accessToken) {
        req.headers["Authorization"] = accessToken.startsWith("Bearer ")
          ? accessToken
          : `Bearer ${accessToken}`;
      }
    }

    return req;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError): Promise<AxiosResponse> => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken: string | null =
          localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("Refresh token not found");
        }

        interface RefreshTokenResponse {
          data?: {
            accessToken?: {
              token: string;
              expireAt: number;
              refreshToken: string;
            };
          };
          token?: string;
          expireAt?: number;
          refreshToken?: string;
        }

        const refreshResponse: AxiosResponse<RefreshTokenResponse> =
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            refreshToken,
          });

        const responseData = refreshResponse.data;

        const token: string =
          responseData.data?.accessToken?.token || responseData.token || "";
        const expireAt: number =
          responseData.data?.accessToken?.expireAt ||
          responseData.expireAt ||
          0;
        const newRefreshToken: string =
          responseData.data?.accessToken?.refreshToken ||
          responseData.refreshToken ||
          "";

        if (typeof window !== "undefined") {
          const now: number = Math.floor(Date.now() / 1000);
          const tokenMaxAge: number = expireAt ? expireAt - now : 3600;

          document.cookie = `sessionId=${token}; path=/; max-age=${tokenMaxAge}; SameSite=Lax`;
          document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=${604800}; SameSite=Lax`;

          localStorage.setItem("sessionId", token);
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${token}`;

        onRefreshed(token);

        return api(originalRequest);
      } catch (refreshError: unknown) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("sessionId");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("fullname");

          document.cookie = "sessionId=; path=/; max-age=0";
          document.cookie = "refreshToken=; path=/; max-age=0";
        }

        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
