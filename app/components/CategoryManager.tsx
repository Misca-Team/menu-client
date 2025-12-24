"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import {
  deleteCategory,
  getCategoriesPanel,
  updateCategory,
  createProduct,
} from "../services/request";

import UiLoader from "../ui/UiLoader";
import FormCreateCategory from "./FormCreateCategory";
import api from "../configs/api";
import { FiInbox, FiMoreVertical } from "react-icons/fi";

const DEFAULT_IMAGE = "/images/default.webp";

type Product = {
  id: string;
  name: string;
  finalPrice: number;
  images: string[];
};

type Category = {
  id: string;
  title: string;
  displayOrder?: number;
  products: Product[];
};

type CreateProductForm = {
  name: string;
  price: number;
  isAvailable: boolean;
  calories: number | null;
  averagePreparationMinutes: number | null;
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    // @ts-ignore
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });

async function getCroppedBlob(imageSrc: string, crop: any) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = crop.width;
  canvas.height = crop.height;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );
  return new Promise<Blob>((resolve) =>
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg")
  );
}

export default function CategoryManager() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug ?? "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchQuery);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDisplayOrder, setEditDisplayOrder] = useState(0);
  const [editLoading, setEditLoading] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);

  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [createLoading, setCreateLoading] = useState(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset } = useForm<CreateProductForm>({
    defaultValues: {
      isAvailable: true,
      calories: null,
      averagePreparationMinutes: null,
    },
  });

  useEffect(() => {
    if (!slug) return;
    fetchCategories();
  }, [slug]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategoriesPanel({ slug });
      setCategories(res.categories || []);
    } catch {
      toast.error("خطا در دریافت دسته‌بندی‌ها");
    } finally {
      setLoading(false);
    }
  };

  /* ======================= Search ======================= */
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
    value ? params.set("q", value) : params.delete("q");
    router.replace(`?${params.toString()}`);
  };

  /* ======================= Edit Category ======================= */
  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditTitle(cat.title);
    setEditDisplayOrder(cat.displayOrder || 0);
    setIsEditCategoryOpen(true);
    setActiveMenu(null);
  };

  const handleSaveCategoryEdit = async () => {
    if (!editingCategory || !slug) return;
    setEditLoading(true);
    try {
      await updateCategory(
        editingCategory.id,
        { title: editTitle, order: editDisplayOrder },
        slug
      );
      toast.success("دسته‌بندی بروزرسانی شد");
      fetchCategories();
      setIsEditCategoryOpen(false);
    } catch {
      toast.error("خطا در بروزرسانی دسته‌بندی");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!slug) return;
    try {
      await deleteCategory(cat.id, slug);
      toast.success("دسته‌بندی حذف شد");
      fetchCategories();
      setActiveMenu(null);
    } catch {
      toast.error("خطا در حذف دسته‌بندی");
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(e.target.files[0]);
  };

  const onCropComplete = useCallback((_: any, cropped: any) => {
    setCroppedArea(cropped);
  }, []);

  const uploadCroppedImage = async () => {
    if (!imageSrc || !croppedArea) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea);
      const formData = new FormData();
      formData.append("file", blob, "product.jpg");

      const res = await api.post("/files/temp", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImageId(res.data.id);
      toast.success("عکس آپلود شد");
      setImageSrc(null);
    } catch {
      toast.error("خطا در آپلود عکس");
    } finally {
      setUploading(false);
    }
  };

  console.log({ categories, imageId });

  const onCreateProduct = async (data: CreateProductForm) => {
    if (!selectedCategory || !slug) return;
    setCreateLoading(true);
    try {
      await createProduct(
        {
          ...data,
          categoryId: selectedCategory.id,
          imageId,
        },
        slug
      );
      toast.success("محصول با موفقیت ثبت شد");
      setIsCreateProductOpen(false);
      reset();
      setImageId(null);
      fetchCategories();
    } catch {
      toast.error("خطا در ثبت محصول");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">مدیریت دسته‌بندی‌ها</h1>
          <Input
            placeholder="جستجو..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-56"
          />
        </div>
        <div className="flex items-center gap-3">
          <FormCreateCategory onSuccess={fetchCategories} />
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
          موردی یافت نشد
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {filteredCategories.map((cat) => (
            <AccordionItem key={cat.id} value={cat.id}>
              <AccordionTrigger className="bg-white p-4 rounded-xl shadow relative flex justify-between">
                <div className="flex items-center gap-3">
                  <FiMoreVertical />
                  <span>{cat.title}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === cat.id ? null : cat.id);
                  }}
                ></button>

                {activeMenu === cat.id && (
                  <div className="absolute top-12 right-4 bg-white shadow rounded-md text-sm z-10">
                    <button
                      className="block px-4 py-2 hover:bg-gray-100 w-full text-right"
                      onClick={() => handleEditCategory(cat)}
                    >
                      ویرایش
                    </button>
                    <button
                      className="block px-4 py-2 hover:bg-red-50 text-red-600 w-full text-right"
                      onClick={() => handleDeleteCategory(cat)}
                    >
                      حذف
                    </button>
                  </div>
                )}
              </AccordionTrigger>

              <AccordionContent className="space-y-4">
                <Button
                  className="mt-4 bg-blue-500 cursor-pointer hover:bg-blue-600"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsCreateProductOpen(true);
                  }}
                >
                  + ثبت محصول
                </Button>

                {cat.products.length >= 1 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {cat.products.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white rounded-xl shadow p-3 text-center"
                      >
                        <div className="h-24 relative mb-2">
                          <Image
                            src={p.images?.[0] || DEFAULT_IMAGE}
                            alt={p.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {p.finalPrice.toLocaleString()} تومان
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-300 font-bold">
                    برای این دسته بندی محصولی ثبت نشده
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ثبت محصول در «{selectedCategory?.title}»</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onCreateProduct)} className="space-y-3">
            <Input
              placeholder="نام محصول"
              {...register("name", { required: "نام محصول الزامی است" })}
            />

            <Input
              type="number"
              placeholder="قیمت (تومان)"
              {...register("price", {
                required: "قیمت الزامی است",
                valueAsNumber: true,
              })}
            />

            {/* موجود / ناموجود */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register("isAvailable")}
                className="accent-black"
              />
              محصول موجود است
            </label>

            <Input
              type="number"
              placeholder="کالری (اختیاری)"
              {...register("calories", {
                valueAsNumber: true,
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
            />

            <Input
              type="number"
              placeholder="زمان آماده‌سازی (دقیقه)"
              {...register("averagePreparationMinutes", {
                valueAsNumber: true,
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
            />

            <Input type="file" accept="image/*" onChange={onSelectFile} />
            {imageSrc && (
              <div className="relative h-64 bg-black mt-2">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
                <Button
                  className="absolute bottom-2 left-2"
                  onClick={uploadCroppedImage}
                  disabled={uploading}
                >
                  {uploading ? "در حال آپلود..." : "تایید عکس"}
                </Button>
              </div>
            )}
            {imageId && (
              <p className="text-xs text-green-600">عکس آپلود شد ✔</p>
            )}

            <DialogFooter>
              <Button
                className="bg-blue-500 hover:bg-blue-600"
                type="submit"
                disabled={createLoading}
              >
                {createLoading ? "در حال ثبت..." : "ثبت محصول"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش دسته‌بندی</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="عنوان"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <Input
            type="number"
            placeholder="ترتیب نمایش"
            value={editDisplayOrder}
            onChange={(e) => setEditDisplayOrder(+e.target.value)}
          />

          <DialogFooter>
            <Button onClick={handleSaveCategoryEdit} disabled={editLoading}>
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
