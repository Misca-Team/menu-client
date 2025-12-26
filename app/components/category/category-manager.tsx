"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { FiInbox, FiMoreVertical, FiTrash2 } from "react-icons/fi";

import {
  deleteCategory,
  getProductsInPanelMenu,
  deleteProduct,
} from "@/app/services/request";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import UiLoader from "@/app/ui/UiLoader";
import CreateCategoryForm from "./create-category-form";
import CreateProductForm from "../product/create-product-form";
import EditCategoryDialog from "./edit-category-dialog";

const DEFAULT_IMAGE = "/images/default.webp";

type ProductImage = {
  id: string;
  imageUrl: string;
};

type Product = {
  id: string;
  name: string;
  finalPrice: number;
  images: ProductImage[];
};

type Category = {
  id: string;
  title: string;
  displayOrder?: number;
  products: Product[];
};

export default function CategoryManager() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug ?? "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchQuery);

  // Edit Category State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState<boolean>(false);

  // Create Product State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isCreateProductOpen, setIsCreateProductOpen] =
    useState<boolean>(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProductsInPanelMenu({ slug });
      // Handle potential API inconsistency or type mismatch
      const categoriesData = res.data?.categories || (res as any).categories || [];
      setCategories(categoriesData);
    } catch {
      toast.error("خطا در دریافت دسته‌بندی‌ها");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    fetchCategories();
  }, [fetchCategories, slug]);

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    return categories.filter(
      (cat) =>
        cat.title.toLowerCase().includes(search) ||
        cat.products.some((p) => p.name.toLowerCase().includes(search))
    );
  }, [categories, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.replace(`?${params.toString()}`);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟")) return;
    try {
      await deleteCategory(id);
      toast.success("دسته‌بندی با موفقیت حذف شد");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      toast.error("خطا در حذف دسته‌بندی");
      console.error(error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!slug) return;
    if (!confirm("آیا از حذف این محصول اطمینان دارید؟")) return;
    try {
      await deleteProduct(productId, slug);
      toast.success("محصول حذف شد");
      fetchCategories();
    } catch (err) {
      console.error("خطا در حذف محصول:", err);
      toast.error("خطا در حذف محصول");
    }
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setIsEditCategoryOpen(true);
  };

  const openCreateProduct = (cat: Category) => {
    setSelectedCategory(cat);
    setIsCreateProductOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <h1 className="text-2xl font-bold whitespace-nowrap">
            مدیریت منو
          </h1>
          <Input
            placeholder="جستجو در دسته‌ها و محصولات..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:w-64 bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <CreateCategoryForm onSuccess={fetchCategories} />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-32 flex justify-center">
          <UiLoader />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-32 text-center text-gray-500">
          <FiInbox size={48} className="mx-auto mb-4" />
          {search ? "موردی با این جستجو یافت نشد" : "هیچ دسته‌بندی‌ای وجود ندارد"}
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {filteredCategories.map((cat) => (
            <AccordionItem key={cat.id} value={cat.id} className="border-none">
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="flex items-center justify-between p-4 pr-2">
                  <AccordionTrigger className="hover:no-underline py-0 flex-1">
                    <span className="text-lg font-medium mr-2">
                      {cat.title}
                    </span>
                  </AccordionTrigger>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FiMoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditCategory(cat)}>
                        ویرایش
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <AccordionContent className="px-4 pb-4 pt-0">
                  <div className="mt-4 mb-4">
                    <Button
                      size="sm"
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                      onClick={() => openCreateProduct(cat)}
                    >
                      + ثبت محصول جدید
                    </Button>
                  </div>

                  {cat.products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {cat.products.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white border rounded-xl p-3 flex flex-col gap-2 relative group hover:shadow-md transition-shadow"
                        >
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={p.images?.[0]?.imageUrl || DEFAULT_IMAGE}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="font-medium text-sm truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {p.finalPrice.toLocaleString()} تومان
                            </p>
                          </div>
                          <button
                            className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm"
                            onClick={() => handleDeleteProduct(p.id)}
                            title="حذف محصول"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic text-center py-8 border-2 border-dashed rounded-lg">
                      محصولی در این دسته‌بندی وجود ندارد
                    </p>
                  )}
                </AccordionContent>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Edit Category Dialog */}
      <EditCategoryDialog
        open={isEditCategoryOpen}
        onOpenChange={setIsEditCategoryOpen}
        category={editingCategory}
        slug={slug}
        onSuccess={fetchCategories}
      />

      {/* Create Product Dialog */}
      <Dialog
        open={isCreateProductOpen}
        onOpenChange={setIsCreateProductOpen}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              ثبت محصول در «{selectedCategory?.title}»
            </DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <CreateProductForm
              categoryId={selectedCategory.id}
              slug={slug}
              onSuccess={() => {
                fetchCategories();
                setIsCreateProductOpen(false);
              }}
              onCancel={() => setIsCreateProductOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
