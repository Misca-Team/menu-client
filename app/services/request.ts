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
  return apiClient.post<any>("/business", data);
};

export const getBusinesses = async (params?: GetBusinessesParams) => {
  return apiClient.get<BusinessesResponse>("/business", { params });
};

// Category
export const createCategory = async (data: CreateCategoryPayload) => {
  return apiClient.post<any>("/category", data);
};

export const updateCategory = async (
  id: string,
  data: { title: string; order: number },
  slug: string
) => {
  // Assuming PUT /category/{id} with slug in body or params if needed
  // Based on usage, slug is passed.
  return apiClient.put<any>(`/category/${id}`, { ...data, slug });
};

export const deleteCategory = async (id: string) => {
  return apiClient.delete<any>(`/category/${id}`);
};

// Product
export const createProduct = async (
  data: CreateProductPayload,
  slug: string
) => {
  return apiClient.post<any>("/product", { ...data, slug });
};

export const deleteProduct = async (id: string, slug: string) => {
  return apiClient.delete<any>(`/product/${id}`, { params: { slug } });
};

// Menu
export const getProductsInPanelMenu = async ({ slug }: { slug: string }) => {
  // Endpoint guess based on "panel menu"
  return apiClient.get<any>(`/business/${slug}/menu/panel`);
};
