"use client";
import { FC } from "react";
import { AccordionProps } from "../types/interfaces";

const Accordion: FC<AccordionProps> = ({ title, icon, className = "" }) => {
  return (
    <div
      className={`border cursor-pointer flex items-center justify-start p-3 border-gray-300 max-w-full w-full sm:w-[138.42px] rounded-sm ${className}`}
    >
      <div className="flex items-center gap-1">
        {icon && <span>{icon}</span>}
        <span className="text-[14px] text-body">{title}</span>
      </div>
    </div>
  );
};

export default Accordion;
