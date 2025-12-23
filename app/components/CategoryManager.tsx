"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiInbox, FiMenu, FiMoreVertical } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getCategoriesPanel, updateCategory } from "../services/request";
import UiLoader from "../ui/UiLoader";
import FormCreateCategory from "./FormCreateCategory";

export default function CategoryManager() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug ?? "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchQuery);
  const [showCategories, setShowCategories] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [editLoading, setEditLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchCategories();
  }, [slug]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategoriesPanel({
        page: 1,
        pageSize: 50,
        sort: "displayOrder",
        slug,
      });
      setCategories(res.items || []);
    } catch {
      toast.error("خطا در دریافت دسته‌بندی‌ها");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter((item) =>
      item.title.toLowerCase().includes(searchQuery)
    );
  }, [categories, searchQuery]);

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(window.location.search);
    if (value.trim()) params.set("q", value);
    else params.delete("q");
    router.replace(`?${params.toString()}`);
  };

  const handleEditClick = (category: any) => {
    setEditingCategory(category);
    setEditTitle(category.title);
    setEditOrder(category.order);
    setActiveMenu(null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;
    setEditLoading(true);
    try {
      await updateCategory(
        editingCategory.id,
        { title: editTitle, order: editOrder },
        slug
      );
      toast.success("دسته‌بندی بروزرسانی شد");
      fetchCategories();
      setIsEditOpen(false);
      setEditingCategory(null);
    } catch {
      toast.error("خطا در بروزرسانی");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (category: any) => {
    toast(`حذف دسته‌بندی: ${category.title}`);
    setActiveMenu(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">دسته‌بندی‌ها</h1>
          {showCategories && (
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="جستجوی دسته‌بندی..."
              className="max-w-xs"
            />
          )}
        </div>
        <FormCreateCategory onSuccess={fetchCategories} />
      </div>

      {/* Toggle Button */}
      <div className="flex justify-start mb-6">
        <Button
          onClick={() => setShowCategories(!showCategories)}
          className="flex bg-blue-500 hover:bg-blue-600 transition cursor-pointer items-center gap-2"
        >
          <FiMenu size={20} />
          {showCategories ? "پنهان کردن دسته‌بندی‌ها" : "نمایش دسته‌بندی‌ها"}
        </Button>
      </div>

      {/* Cards */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          showCategories
            ? "opacity-100 max-h-screen"
            : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center py-32">
            <UiLoader />
            <p className="mt-3 text-gray-500">در حال دریافت داده‌ها...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-gray-500">
            <FiInbox size={48} />
            <p className="mt-4">هیچ دسته‌بندی‌ای وجود ندارد</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-gray-500">
            <FiInbox size={48} />
            <p className="mt-4">موردی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
            {filteredCategories.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-gray-200 bg-white p-6 text-center hover:shadow-xl hover:border-blue-500 transition-all"
              >
                {/* Menu */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() =>
                      setActiveMenu(activeMenu === item.id ? null : item.id)
                    }
                    className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <FiMoreVertical size={20} />
                  </button>

                  {activeMenu === item.id && (
                    <div className="absolute right-0 top-6 w-32 bg-white border rounded-lg shadow-md flex flex-col text-sm z-10">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="px-3 py-2 hover:bg-gray-100 text-right"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="px-3 py-2 hover:bg-gray-100 text-right text-red-600"
                      >
                        حذف
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-800 group-hover:text-blue-600">
                  {item.title}
                  {/* {item.products.length} */}
                </h3>
                <div className="mt-3 text-sm text-gray-500">
                  {item.products.length >= 1
                    ? `${item.products.length} محصول`
                    : "محصولی ثبت نشده"}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  الویت: {item.order}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ویرایش دسته‌بندی</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 mt-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="عنوان"
            />
            <Input
              type="number"
              value={editOrder}
              onChange={(e) => setEditOrder(+e.target.value)}
              placeholder="الویت"
            />
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              انصراف
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 "
              onClick={handleSaveEdit}
              disabled={editLoading}
            >
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
