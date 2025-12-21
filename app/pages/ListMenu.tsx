"use client";

import { useRef } from "react";
import ContentProducts from "../components/ContentProducts";
import HaderMenu from "../components/HaderMenu";
// @ts-ignore
import { ListMenuProps } from "../types/interfaces";

function ListMenu({ menuData, slug }: ListMenuProps) {
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);

  const addToRefs = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      categoryRefs.current[index] = el;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EBDCD0]">
      {/* Header Wrapper  */}
      <header className="w-full px-3 sm:px-6 mt-4">
        <section
          className="
            md:bg-[#EBDED3]
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
        footer
      </footer>
    </div>
  );
}

export default ListMenu;
