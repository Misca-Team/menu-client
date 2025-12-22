import api from "../configs/api";
import {
  CreateBusinessPayload,
  CreateCategoryPayload,
  GetBusinessesParams,
} from "../types/interfaces";

interface LoginResponse {
  token: string;
  refreshToken: string;
}

export const loginRequest = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const res = await api.post("/auth/signin-password", { username, password });
  const { token, refreshToken } = res.data.data.accessToken;

  if (typeof window !== "undefined") {
    localStorage.setItem("sessionId", `Bearer ${token}`);
    localStorage.setItem("refreshToken", refreshToken);
  }

  return { token, refreshToken };
};

export const uploadCroppedImage = async (file: File) => {
  const formData = new FormData();
  formData.append("files", file);

  // خوندن توکن مستقیم از کوکی
  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : null;
  };

  const token = getCookie("sessionId");

  const res = await api.post("/files/temp", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: false,
  });

  return res.data;
};

export const createBusiness = async (payload: CreateBusinessPayload) => {
  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : null;
  };

  const token = getCookie("sessionId");

  try {
    const response = await api.post(`/workspace/businesses`, payload, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      withCredentials: false,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating business:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// گرفتن کسب و کارها

export const getBusinesses = async (
  params: GetBusinessesParams = {}
): Promise<any> => {
  try {
    const response = await api.get("/workspace/businesses", {
      params,
    });

    return {
      isSuccess: true,
      data: response.data || [],
      messages: [],
      errors: [],
    };
  } catch (error: any) {
    console.error("Error fetching businesses:", error);

    return {
      isSuccess: false,
      data: [],
      messages: error.response?.data?.messages || ["خطا در دریافت کسب‌وکارها"],
      errors: error.response?.data?.errors || [],
    };
  }
};

interface GetCategoriesParams {
  page?: number;
  pageSize?: number;
  sort?: string;
}

export async function getCategories(
  params: GetCategoriesParams = { page: 1, pageSize: 10, sort: "displayOrder" }
) {
  try {
    const res = await api.get("/panel/categories", {
      params,
    });

    return res.data;
  } catch (error: any) {
    console.error(
      "Error fetching categories:",
      error.response || error.message
    );
    return null;
  }
}

export const createCategory = async (data: {
  title: string;
  displayOrder: number;
  businessId: string;
}) => {
  try {
    const res = await api.post("/panel/categories", data);
    return res.data;
  } catch (err: any) {
    console.error(
      "Error creating category:",
      err.response?.data || err.message
    );
    throw err;
  }
};
