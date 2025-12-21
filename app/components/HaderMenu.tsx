"use client";

import { FC, useEffect, useRef, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

interface HeaderMenuProps {
  menuData: {
    categories?: { id: string; title: string }[];
  };
  categoryRefs?: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

const HeaderMenu: FC<HeaderMenuProps> = ({ menuData, categoryRefs }) => {
  const categories = menuData?.categories ?? [];
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);

      if (stickyRef.current) {
        stickyRef.current.style.backdropFilter = `blur(${Math.min(
          window.scrollY / 100,
          8
        )}px)`;
        stickyRef.current.style.backgroundColor = `rgba(255, 255, 255, ${Math.min(
          window.scrollY / 200,
          0.9
        )})`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const handleClick = (index: number) => {
    const target = categoryRefs?.current[index];
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setOpen(false);
    }
  };

  return (
    <header className="relative">
      {/* منو دسکتاپ */}
      <nav className="hidden md:flex items-center gap-6">
        {categories.map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleClick(index)}
            className="text-[14px] text-[#344E7C] hover:text-[#7b96c4] transition-colors font-medium px-3 py-1.5 rounded-lg"
          >
            {item.title}
          </button>
        ))}
      </nav>

      <div
        ref={stickyRef}
        className={`fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-500 ease-out ${
          scrolled
            ? "shadow-lg backdrop-blur-md"
            : "bg-transparent backdrop-blur-none"
        }`}
        style={{
          transition:
            "background-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div className="container mx-auto px-4 py-3 flex justify-start">
          <button
            onClick={() => setOpen(true)}
            className={`
              p-3 rounded-xl cursor-pointer transition-all duration-300
              ${
                scrolled
                  ? " shadow-md border border-gray-200 hover:shadow-lg hover:scale-105"
                  : " shadow-sm border border-gray-500 "
              }
            `}
            aria-label="Open menu"
          >
            <FiMenu
              size={22}
              className={`transition-colors ${
                scrolled ? "text-gray-800" : "text-gray-700"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="md:hidden h-16" />

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm cursor-pointer"
          onClick={() => setOpen(false)}
        />
      )}

      {/* منو موبایل */}
      <aside
        ref={menuRef}
        className={`
          fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm
          bg-[#EBDCD0]
          shadow-2xl
          transform transition-transform duration-500 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* هدر منو */}
        <div className="sticky top-0 z-10 bg-[#EBDCD0] backdrop-blur-sm">
          <div className="flex items-center justify-between p-5">
            <span className="font-bold text-[17px] text-gray-800">
              منوی کافه
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="p-2 rounded-lg cursor-pointer transition-colors"
            >
              <FiX size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* لیست دسته‌بندی‌ها */}
        <div className="h-[calc(100vh-80px)] overflow-y-auto pb-6">
          <nav className="flex flex-col p-4 gap-2">
            {categories.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleClick(index)}
                className="text-[15.5px] text-gray-800 font-medium py-3.5 px-4 rounded-xl cursor-pointer hover:text-blue-700 transition-all duration-200 text-right flex items-center justify-between"
              >
                <span>{item.title}</span>
              </button>
            ))}
          </nav>

          {/* فوتر منو */}
          <div className="px-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-gray-500 text-sm">
              <p>تعداد دسته‌بندی‌ها: {categories.length}</p>
            </div>
          </div>
        </div>
      </aside>
    </header>
  );
};

export default HeaderMenu;
