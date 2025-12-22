"use client";
import { FC } from "react";
import { BusinessItems } from "../types/interfaces";
import Image from "next/image";
import dynamic from "next/dynamic";

const BusinessMap = dynamic(() => import("./BusinessMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-55 sm:h-75 bg-gray-200 rounded-md animate-pulse" />
  ),
});

const FALLBACK_LOGO = "/images/fallback-logo.png";

const AddressComponents: FC<BusinessItems> = ({ menuData }) => {
  if (!menuData) return null;

  const { name, logo, businessLocation } = menuData;
  const address = businessLocation?.postalAddress;
  const lat = businessLocation?.latitude;
  const lng = businessLocation?.longitude;

  return (
    <div
      suppressHydrationWarning
      className="bg-[#ECE1D8] rounded-md px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-col sm:flex-row">
        <div className="shrink-0">
          <Image
            src={
              logo
                ? `https://misca.ir/assets/images/business/${logo}`
                : FALLBACK_LOGO
            }
            width={56}
            height={56}
            className="rounded-md object-cover w-14 h-14 sm:w-16 sm:h-16"
            alt={name ?? "Business logo"}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_LOGO;
            }}
          />
        </div>

        <div className="flex flex-col text-center sm:text-right gap-1">
          {name && (
            <p className="text-[16px] sm:text-[18px] font-bold text-[#344E7C]">
              {name}
            </p>
          )}
          {address && (
            <p className="text-[12px] sm:text-[13px] font-normal text-[#325172]">
              {address}
            </p>
          )}
        </div>
      </div>

      {typeof lat === "number" && typeof lng === "number" && (
        <div className="mt-4">
          <BusinessMap
            latitude={lat}
            longitude={lng}
            name={name}
            address={address}
          />
        </div>
      )}
    </div>
  );
};

export default AddressComponents;
