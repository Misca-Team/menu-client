import { notFound } from "next/navigation";
import ListMenu from "@/app/pages/ListMenu";
import Link from "next/link";
// @ts-ignore
import { MenuData } from "@/app/types/interfaces";

export interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getMenuData(slug: string): Promise<MenuData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/business/menu`
      : "https://api.misca.ir/business/menu";

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-slug": slug,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
      // زمان انتظار بیشتر
      next: { revalidate: 0 },
    });

    // اگر response اصلاً نیامد
    if (!response) {
      console.error("No response from API");
      return null;
    }

    // بررسی status کد
    if (!response.ok) {
      // لاگ خطا
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);

      // اگر 404 بود، مستقیماً notFound فراخوانی می‌شود
      if (response.status === 404) {
        return null; // یا throw new Error('Not found')
      }

      return null;
    }

    const data = await response.json();

    // بررسی ساختار داده
    if (!data || typeof data !== "object") {
      console.error("Invalid data structure:", data);
      return null;
    }

    // پردازش لوگو
    if (data.business?.logo) {
      data.business.logo = data.business.logo.replace(/\r\n/g, "").trim();
    }

    return data;
  } catch (error: any) {
    console.error("Fetch error:", error.message);
    return null;
  }
}

export default async function BusinessMenuPage({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // بررسی slug
    if (!slug || typeof slug !== "string" || slug.trim().length < 2) {
      notFound();
    }

    const menuData = await getMenuData(slug);

    // بررسی دقیق‌تر
    if (!menuData || !menuData.business) {
      console.error("No valid data returned from API");
      notFound();
    }

    // بررسی فیلدهای ضروری
    if (!menuData.business.name || !menuData.categories) {
      console.error("Missing required fields in data");
      notFound();
    }

    return (
      <div>
        <ListMenu menuData={menuData} slug={slug} />
      </div>
    );
  } catch (error: any) {
    console.error("Page error:", error);

    // اگر خطا مربوط به not found باشد
    if (error.message?.includes("NEXT_NOT_FOUND")) {
      notFound();
    }

    // برای خطاهای دیگر صفحه خطا نمایش دهید
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">خطای سرور</h1>
          <p className="text-gray-600 mb-4">
            مشکلی در بارگذاری صفحه پیش آمده است.
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    );
  }
}
