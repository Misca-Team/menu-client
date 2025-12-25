import api from "../configs/api";
import {
  CreateBusinessPayload,
  CreateCategoryPayload,
  CreateProductPayload,
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

export const createCategory = async ({
  title,
  displayOrder,
  slug,
}: CreateCategoryPayload) => {
  const res = await api.post(
    "/panel/categories",
    {
      title,
      displayOrder,
    },
    {
      headers: {
        "x-slug": slug,
      },
    }
  );

  return res.data;
};

interface GetCategoriesPanelProps {
  page?: number;
  pageSize?: number;
  sort?: string;
  slug: string;
}

// export const getCategoriesPanel = async ({
//   page = 1,
//   pageSize = 10,
//   sort = "displayOrder",
//   slug,
// }: GetCategoriesPanelProps) => {
//   if (!slug) throw new Error("Slug is required for /panel requests");

//   try {
//     const token = localStorage.getItem("sessionId");
//     if (!token) throw new Error("User is not authenticated");

//     const res = await api.get("/panel/categories", {
//       params: { page, pageSize, sort },
//       headers: {
//         "x-slug": slug,
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     return res.data;
//   } catch (err: any) {
//     console.error("Error fetching panel categories:", err.response || err);
//     throw err;
//   }
// };

export const getCategoriesPanel = async ({ slug }: GetCategoriesPanelProps) => {
  if (!slug) throw new Error("Slug is required for /panel requests");

  try {
    const token = localStorage.getItem("sessionId");
    if (!token) throw new Error("User is not authenticated");

    const res = await api.get("/business/menu", {
      params: { slug },
      headers: {
        "x-slug": String(slug),
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err: any) {
    console.error("Error fetching panel categories:", err.response || err);
    throw err;
  }
};

// گرفتن محصولات از پنل منو
export const getProductsInPanelMenu = async ({
  slug,
}: GetCategoriesPanelProps) => {
  if (!slug) throw new Error("Slug is required for /panel requests");

  try {
    const token = localStorage.getItem("sessionId");
    if (!token) throw new Error("User is not authenticated");

    const res = await api.get("/panel/menu", {
      params: { slug },
      headers: {
        "x-slug": String(slug),
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err: any) {
    console.error("Error fetching panel categories:", err.response || err);
    throw err;
  }
};

// برای آپدیت دسته بندی های
export const updateCategory = async (
  id: string,
  data: { title: string; order: number },
  slug: string
) => {
  const res = await api.put(`/panel/categories/${id}`, data, {
    headers: { "x-slug": slug },
  });
  return res.data;
};

// پاک کردن دسته بندی
export const deleteCategory = async (CATEGORY_ID: string, slug: string) => {
  const res = await api.delete(`/panel/categories/${CATEGORY_ID}`, {
    headers: { "x-slug": slug },
    withCredentials: true,
  });
  return res.data;
};

// پاک کردن محصول
export const deleteProduct = async (productId: string, slug: string) => {
  try {
    const response = await api.delete(`/panel/products/${productId}`, {
      headers: {
        "x-slug": slug,
      },
      withCredentials: true,
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete product",
      status: error.response?.status,
    };
  }
};
// ساخت محصول
export const createProduct = async (
  data: CreateProductPayload,
  slug: string
) => {
  const res = await api.post("/panel/products", data, {
    headers: {
      "x-slug": slug,
    },
  });

  return res.data;
};
