import apiClient from "../configs/api";
import {
  CreateBusinessPayload,
  CreateCategoryPayload,
  CreateProductPayload,
  GetBusinessesParams,
  BusinessesResponse,
} from "../types/interfaces";
import { LoginResponse, UploadResult, ApiResponse } from "../types/api";

interface LegacyLoginResponse {
  token: string;
  refreshToken: string;
}

/**
 * @deprecated Use useLogin hook instead.
 */
export const loginRequest = async (
  username: string,
  password: string
): Promise<LegacyLoginResponse> => {
  const res = await apiClient.post<LoginResponse>("/auth/signin-password", {
    username,
    password,
  });

  const accessToken = res.data.accessToken.token;
  const refreshToken = res.data.accessToken.refreshToken;

  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  return {
    token: accessToken,
    refreshToken,
  };
};

// Files
export const uploadCroppedImage = async (file: File) => {
  const formData = new FormData();
  formData.append("files", file);

  const res = await apiClient.post<UploadResult[]>("/files/temp", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res;
};

// Business
export const createBusiness = async (data: CreateBusinessPayload) => {
  return apiClient.post<any>("/workspace/business", data);
};

export const getBusinesses = async (params?: GetBusinessesParams) => {
  return apiClient.get<BusinessesResponse>("/workspace/business", { params });
};

// Category
export const createCategory = async (data: CreateCategoryPayload) => {
  return apiClient.post<any>("/panel/categories", data, {
    headers: { "x-slug": data.slug },
  });
};

export const updateCategory = async (
  data: { id: string; title: string; order: number },
) => {
  // Assuming PUT /category/{id} with slug in body or params if needed
  // Based on usage, slug is passed.
  return apiClient.post<any>(`/panel/categories/update`, { ...data }, {
    headers: { "x-slug": (data as any).slug },
  });
};

export const deleteCategory = async (id: string) => {
  return apiClient.delete<any>(`/category/${id}`);
};

// Product
export const createProduct = async (
  data: CreateProductPayload,
  slug: string
) => {
  return apiClient.post<any>("/panel/products", { ...data }, {
    headers: { "x-slug": slug },
  });
};

export const deleteProduct = async (id: string, slug: string) => {
  return apiClient.get<any>(`/panel/products/delete/${id}`, {
    headers: { "x-slug": slug },
  });
};

// Menu
export const getProductsInPanelMenu = async ({ slug }: { slug: string }) => {
  // Endpoint guess based on "panel menu"
  return apiClient.get<any>(`/panel/menu`, {
    headers: { "x-slug": slug },
  });
};

// ویرایش محصول
// services/request.ts
export const updateProduct = async (
  payload: { productModel: any },
  slug: string
) => {
  try {
    // لاگ برای بررسی داده‌های ارسالی
    console.log("Payload being sent:", JSON.stringify(payload, null, 2));

    const res = await api.post(`/panel/products/update`, payload, {
      headers: {
        "x-slug": slug,
        "Content-Type": "application/json",
      },
    });

    console.log("Update successful:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Update Product Error:", err.response?.data || err.message);
    console.error("Full error:", err);
    throw new Error("خطا در ویرایش محصول");
  }
};
