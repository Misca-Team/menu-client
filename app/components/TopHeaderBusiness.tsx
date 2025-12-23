"use client";

import Link from "next/link";
import { FaUserAstronaut, FaPowerOff } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import Accordion from "../ui/Acardeon";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePathname } from "next/navigation";

// icons
import { FiMenu } from "react-icons/fi";
import ButtonRoute from "../module/ButtonRoute";

function TopHeaderBusiness() {
  const [showAcardeon, setShowAcardeon] = useState<boolean>(false);
  const [showMobile, setShowMobile] = useState<boolean>(false);

  const accordionRef = useRef<HTMLDivElement | null>(null);
  const [fullname] = useLocalStorage("fullname", "پروفایل");

  const pathname = usePathname();

  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accordionRef.current &&
        !accordionRef.current.contains(event.target as Node)
      ) {
        setShowAcardeon(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    });

    localStorage.removeItem("fullname");

    setShowAcardeon(false);
    router.replace("/auth/login");
  };

  return (
    <div className="max-w-[1512.6px] mx-auto mb-3">
      <div className="flex items-center justify-between max-w-[1512.6px] p-2 mx-auto">
        <section className="flex flex-col items-center gap-4 sm:flex-row">
          <Link className="text-[17.5px] text-[#000000]" href="/">
            میسکا
          </Link>

          {/* show to size mobile */}
          {showMobile && (
            <div ref={accordionRef} className="relative sm:hidden">
              <Link
                href="/workspace/business"
                className="sm:text-[19px] text-[14px] text-[#000000A6]">
                کسب و کارها
              </Link>
              <div
                onClick={() => setShowAcardeon((prev) => !prev)}
                className="flex cursor-pointer items-center gap-1"
              >
                <FaUserAstronaut size={12.25} color="gray" />
                <p className="text-[#000000A6] text-[14px]">
                  {fullname || "پروفایل"}
                </p>
                <IoMdArrowDropdown />
              </div>
              {showAcardeon && (
                <section
                  onClick={handleLogout}
                  className="absolute top-10 -right-4 w-screen sm:w-auto z-50"
                >
                  <Accordion
                    icon={<FaPowerOff />}
                    title="خروج"
                    className="absolute top-0 bg-white right-0 w-[calc(100vw-2rem)] sm:w-auto z-50"
                  />
                </section>
              )}
            </div>
          )}
        </section>

        {/* منوی سایز موبایل */}
        <section
          className="sm:hidden border border-gray-300 p-1 rounded-sm"
          onClick={() => setShowMobile((prev) => !prev)}
        >
          <FiMenu size={30} color="gray" className="cursor-pointer" />
        </section>

        {/* WRAPPER */}
        <div ref={accordionRef} className="relative hidden sm:block">
          <div
            onClick={() => setShowAcardeon((prev) => !prev)}
            className="flex cursor-pointer items-center gap-1"
          >
            <FaUserAstronaut size={12.25} color="gray" />
            <p className="text-[#000000A6] text-[14px]">
              {fullname ? fullname : "نام ثبت نشده است"}
            </p>
            <IoMdArrowDropdown />
          </div>

          {showAcardeon && (
            <section
              onClick={handleLogout}
              className="absolute top-8 left-0 z-50"
            >
              <Accordion
                icon={<FaPowerOff />}
                title="خروج"
                className="text-sm bg-white shadow-md"
              />
            </section>
          )}
        </div>
      </div>
      {/* button created */}
      <section
        className={`${pathname === "/workspace/business/create" ? "hidden" : "block"
          }`}
      >
        <ButtonRoute />
      </section>
    </div>
  );
}

export default TopHeaderBusiness;
