"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { menuCategory } from "@/app/data/menuData";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { FiMenu } from "react-icons/fi";
import { HiHomeModern } from "react-icons/hi2";
import { FaUserAstronaut } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { IoMdArrowDropdown } from "react-icons/io";

export default function PanelHeader() {
  const params = useParams<{ slug?: string }>();
  const cafeName = params?.slug ?? "کافه";
  const [fullname] = useLocalStorage("fullname", "");
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("fullname");
    router.replace("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-800">
          <HiHomeModern className="text-[20px]" />
          <span className="text-[14.5px] font-semibold">{cafeName}</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {menuCategory.map((item) => (
            <Link
              key={item.id}
              href={item.path ?? "#"}
              className="text-sm font-medium text-gray-700 hover:text-[#8b5e3c] transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <BiSupport />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden sm:flex items-center gap-2 text-gray-700"
              >
                <FaUserAstronaut />
                <span className="text-sm font-medium">
                  {fullname || "نام ثبت نشده"}
                </span>
                <IoMdArrowDropdown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                خروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-gray-700">
                <FiMenu size={22} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <SheetTitle className="sr-only">منوی مدیریت</SheetTitle>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center p-3 justify-end w-full">
                  <p className="text-base font-semibold">{cafeName}</p>
                </div>
              </div>

              <nav className="mt-6 flex flex-col gap-1">
                {menuCategory.map((item) => (
                  <Link
                    key={item.id}
                    href={item.path ?? "#"}
                    className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-6 text-xs text-gray-400">
                پنل مدیریت دسته‌بندی‌های کافه
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
