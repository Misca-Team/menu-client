"use client";

import { useEffect, useRef, useState } from "react";
import ContentProducts from "../components/ContentProducts";
import HaderMenu from "../components/HaderMenu";
// @ts-ignore
import { ListMenuProps } from "../types/interfaces";

function ListMenu({ menuData }: ListMenuProps) {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);

  const addToRefs = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      categoryRefs.current[index] = el;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#EBDCD0]">
      {/* Header Wrapper  */}
      <header
        className={`w-full  px-3 sm:px-6 mt-4 sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#EBDCD0]" : "bg-transparent"
        }`}
      >
        <section
          className="
            rounded-md
           md:shadow-sm
            max-w-7xl
            mx-auto
            p-4 sm:p-6
          "
        >
          <HaderMenu menuData={menuData} categoryRefs={categoryRefs} />
        </section>
      </header>

      {/* Main Content  */}
      <main
        className="
          flex-1
          w-full
          max-w-7xl
          mx-auto
          px-3 sm:px-6
          mt-6
        "
      >
        <ContentProducts
          menuData={menuData}
          // @ts-ignore
          addToRefs={addToRefs}
        />
      </main>

      {/* Footer  */}
      <footer
        className="
          w-full
          flex
          items-center
          justify-center
          gap-1
          max-w-7xl
          mx-auto
          px-3 sm:px-6
          mt-10
          mb-6
          text-center
          text-sm
          text-[#5c4a3a]
        "
      >
        <p className="text-[13-75px] text-secondary">قدرت گرفته توسط تیم</p>
        <a
          target="_blank"
          className="text-[13-75px] text-blue-500"
          href="https://github.com/RezaAmd"
        >
          میسکا
        </a>
      </footer>
    </div>
  );
}

export default ListMenu;
