"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ListMenu from "@/app/pages/ListMenu";
// @ts-ignore
import { MenuData } from "@/app/types/interfaces";

export interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

type MenuFetchResult = { data: MenuData | null; status: number };

async function getMenuData(slug: string): Promise<MenuFetchResult> {
  if (!slug) return { data: null, status: 0 };
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/business/menu`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-slug": slug,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!response) {
      console.error("No response from API");
      return { data: null, status: 0 };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);

      return { data: null, status: response.status };
    }

    const data = await response.json();

    if (!data || typeof data !== "object") {
      console.error("Invalid data structure:", data);
      return { data: null, status: 200 };
    }

    if (data.business?.logo) {
      data.business.logo = data.business.logo.replace(/\r\n/g, "").trim();
    }

    return { data, status: 200 };
  } catch (error: any) {
    console.error("Fetch error:", error.message);
    return { data: null, status: 0 };
  }
}
export default function BusinessMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!slug || typeof slug !== "string" || slug.trim().length < 2) {
        setStatus(404);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, status } = await getMenuData(slug);
      if (!active) return;
      setStatus(status);
      setMenuData(data);
      setLoading(false);
    };
    run();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="w-full px-3 sm:px-6 mt-4 sticky top-0 z-50">
          <div className="rounded-md max-w-7xl mx-auto p-4 sm:p-6">
            <div className="h-8 w-40 bg-[#E6D7CB] rounded-md animate-pulse" />
          </div>
        </header>
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#ECE1D8] rounded-2xl overflow-hidden shadow-sm border border-[#d6c9be]"
              >
                <div className="w-full aspect-square bg-[#E6D7CB] animate-pulse" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-4 bg-[#E6D7CB] rounded-md animate-pulse" />
                  <div className="h-4 bg-[#E6D7CB] rounded-md animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <footer className="w-full flex items-center justify-center max-w-7xl mx-auto px-3 sm:px-6 mt-10 mb-6">
          <div className="h-5 w-48 bg-[#E6D7CB] rounded-md animate-pulse" />
        </footer>
      </div>
    );
  }

  if (status === 404) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">منو یافت نشد</h1>
          <p className="text-gray-600 mb-4">کافه مورد نظر یافت نشد.</p>
        </div>
      </div>
    );
  }

  if (!menuData || !menuData.business || !menuData.categories) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">اطلاعات ناقص</h1>
          <p className="text-gray-600 mb-4">اطلاعات لازم برای نمایش منو موجود نیست.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ListMenu menuData={menuData} slug={slug} />
    </div>
  );
}
