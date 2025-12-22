"use client";
import { FC } from "react";
import { BusinessItems } from "../types/interfaces";
import { RiErrorWarningLine } from "react-icons/ri";

const Percentage: FC<BusinessItems> = ({ menuData }) => {
  if (menuData?.vatPercentage === undefined) return null;

  return (
    <div
      className="
        bg-[#ECE1D8]
        rounded-md
        px-3 py-2
        sm:px-4 sm:py-3
        text-[12px]
        sm:text-[14px]
        font-bold
      "
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          gap-2
          leading-relaxed
        "
      >
        <RiErrorWarningLine className="shrink-0 text-[#3B2F2F]" size={18} />

        <span className="whitespace-nowrap">%{menuData.vatPercentage}</span>

        <p className="font-normal text-[#3B2F2F]">
          مالیات بر ارزش افزوده بر قیمت تمامی محصولات اضافه شد.
        </p>
      </div>
    </div>
  );
};

export default Percentage;
