"use client";
import { FC } from "react";
import { BusinessItems } from "../types/interfaces";
import { RiErrorWarningLine } from "react-icons/ri";

const Percentage: FC<BusinessItems> = ({ menuData }) => {
  console.log(menuData);
  return (
    <div className="bg-[#ECE1D8] p-4 font-bold text-[14.20px] rounded-md">
      {menuData?.vatPercentage !== undefined && (
        <div className="flex items-center gap-0.3">
          <RiErrorWarningLine size={20} />% {menuData.vatPercentage}
          <p>مالیات بر ارزش افزوده بر قیمت تمامی محصولات اضافه شد.</p>
        </div>
      )}
    </div>
  );
};

export default Percentage;
