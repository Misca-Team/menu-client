"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { createCategory } from "../services/request";
import { useParams } from "next/navigation";
import { FaPlus } from "react-icons/fa6";
import { FormCreateCategoryProps } from "../types/interfaces";

export default function FormCreateCategory({
  onSuccess,
}: FormCreateCategoryProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const params = useParams<{ slug?: string }>();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("لطفاً عنوان را وارد کنید");
      return;
    }

    if (!params.slug) {
      toast.error("شناسه کسب‌وکار معتبر نیست");
      return;
    }

    console.log("فیلد های ارسال به بک اند:", {
      title,
      displayOrder,
      businessId: params.slug,
    });

    setLoading(true);
    try {
      const res = await createCategory({
        title,
        displayOrder,
        businessId: params.slug,
      });
      console.log("API response:", res);
      toast.success("دسته‌بندی با موفقیت ایجاد شد");
      setTitle("");
      setDisplayOrder(0);
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error creating category:", err);
      toast.error(err?.response?.data?.error || "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-4">
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-sm cursor-pointer flex items-center text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        <FaPlus size={13} />
        جدید
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative p-6 flex flex-col gap-4">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
              aria-label="بستن فرم"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-center">دسته‌بندی جدید</h2>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700">عنوان</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً قهوه"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700">الویت</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                placeholder="مثلاً 0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                لغو
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading && (
                  <span className="loader-border h-4 w-4 border-2 rounded-full border-white border-t-transparent animate-spin"></span>
                )}
                افزودن
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .loader-border {
          border-right-color: transparent;
          border-top-color: white;
          border-bottom-color: white;
          border-left-color: white;
        }
      `}</style>
    </div>
  );
}
