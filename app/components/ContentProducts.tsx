"use client";

import { FC } from "react";
import { UpdatedContentProductsProps } from "../types/interfaces";
import { IoTimeOutline } from "react-icons/io5";

const ContentProducts: FC<UpdatedContentProductsProps> = ({
  menuData,
  addToRefs,
}) => {
  const categories = menuData.categories ?? [];

  return (
    <div className="space-y-16 max-w-252.75">
      {categories.map((category, index) => (
        <section
          key={category.id}
          ref={(el) => addToRefs && addToRefs(el, index)}
          className="space-y-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-[#3B2F2F] pb-2">
            {category.title}
          </h2>

          {category.products.length === 0 ? (
            <p className="text-sm text-[#6b5a4a]">
              آیتمی برای این بخش ثبت نشده است
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {category.products.map((product) => {
                const image = product.images?.[0]?.imageUrl
                  ? `https://misca.ir/assets/images/products/${product.images[0].imageUrl}`
                  : "/images/default.webp";

                return (
                  <div
                    key={product.id}
                    className="bg-[#ECE1D8] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-[#d6c9be]"
                    style={{
                      aspectRatio: "1/1.4",
                    }}
                  >
                    <div className="relative h-[60%] p-2">
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full rounded-2xl object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-3 sm:p-4 space-y-2 h-[40%] flex flex-col justify-between">
                      <h3 className="text-sm sm:text-[15px] font-semibold text-[#2f2a25] line-clamp-2">
                        {product.name}
                      </h3>

                      <div className="flex flex-row-reverse justify-between items-center">
                        <p className="text-sm sm:text-[15.5px] text-[#325172] font-bold">
                          {product.finalPrice.toLocaleString("fa-IR")} تومان
                        </p>

                        {product.averagePreparationMinutes !== null && (
                          <p className="text-xs sm:text-sm font-bold text-[#7a6a5a] whitespace-nowrap flex gap-px items-center">
                            <IoTimeOutline
                              size={15}
                              className="sm:size-4.25"
                              color="gray"
                            />
                            <span>m</span>
                            {product.averagePreparationMinutes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  );
};

export default ContentProducts;
