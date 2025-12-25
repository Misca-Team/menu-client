"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";

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
  getProductsInPanelMenu,
  updateCategory,
  createProduct,
  uploadCroppedImage,
  deleteProduct,
} from "../services/request";

import UiLoader from "../ui/UiLoader";
import FormCreateCategory from "./FormCreateCategory";
import { FiInbox, FiMoreVertical } from "react-icons/fi";
import { UploadedImage } from "../types/types";

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

type CreateProductForm = {
  name: string;
  price: number;
  isAvailable: boolean;
  calories: number | null;
  averagePreparationMinutes: number | null;
  imageId?: string | null;
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
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
  const [productImageId, setProductImageId] = useState<string | null>(null);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDisplayOrder, setEditDisplayOrder] = useState<number>(0);
  const [editLoading, setEditLoading] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState<boolean>(false);

  const [isCreateProductOpen, setIsCreateProductOpen] =
    useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [createLoading, setCreateLoading] = useState<boolean>(false);

  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    null
  );
  const [uploading, setUploading] = useState<boolean>(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [imageId, setImageId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<CreateProductForm>({
    defaultValues: {
      isAvailable: true,
      calories: null,
      averagePreparationMinutes: null,
      imageId: null,
    },
  });

  useEffect(() => {
    if (!slug) return;
    fetchCategories();
  }, [slug]);

  console.log(categories);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getProductsInPanelMenu({ slug });
      setCategories(res.categories || []);
    } catch {
      toast.error("خطا در دریافت دسته‌بندی‌ها");
    } finally {
      setLoading(false);
    }
  };

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
      fetchCategories(); // ری‌فچ کردن دسته‌بندی‌ها
      setIsEditCategoryOpen(false); // بستن مودال
    } catch (err) {
      console.error("خطا در بروزرسانی دسته‌بندی:", err);
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
    } catch (err) {
      console.error("خطا در حذف دسته‌بندی:", err);
      toast.error("خطا در حذف دسته‌بندی");
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    if (uploadedImage) {
      toast.error("شما فقط می‌توانید یک عکس اضافه کنید");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(e.target.files[0]);
  };

  const onCropComplete = useCallback((_: any, cropped: any) => {
    setCroppedArea(cropped);
  }, []);

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedArea) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea);
      const file = new File([blob], "product.jpg", { type: "image/jpeg" });

      const res = await uploadCroppedImage(file);
      if (res?.isSuccess && res.data?.length) {
        const image = res.data[0];
        setUploadedImage({ id: image.id, url: image.url });
        setProductImageId(image.id);
        console.log("Product Image ID saved in state:", image.id);
      }
      console.log("uploadCroppedImage res:", res);

      if (!res?.isSuccess || !res.data?.length) {
        toast.error("آپلود عکس ناموفق بود");
        return;
      }

      const image = res.data[0];

      setUploadedImage({ id: image.id, url: image.url });
      setImageId(image.id);
      console.log("Image ID saved:", image.id);

      toast.success("عکس با موفقیت آپلود شد");
      setImageSrc(null);
    } catch (err) {
      console.log("Upload error:", err);
      toast.error("خطا در آپلود عکس");
    } finally {
      setUploading(false);
    }
  };

  const onCreateProduct = async (data: CreateProductForm) => {
    if (!selectedCategory || !slug) return;

    if (!imageId) {
      toast.error("لطفاً ابتدا عکس را آپلود کنید");
      return;
    }

    setCreateLoading(true);
    try {
      const payload = {
        ...data,
        categoryId: selectedCategory.id,
        imageId: productImageId,
      };
      console.log("Submitting product:", payload);

      await createProduct(payload, slug);
      toast.success("محصول با موفقیت ثبت شد");
      setIsCreateProductOpen(false);

      reset();
      setUploadedImage(null);
      setImageId(null);
      fetchCategories();
    } catch (err) {
      console.log("Create product error:", err);
      toast.error("خطا در ثبت محصول");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!slug) return;
    try {
      await deleteProduct(productId, slug); // ← اینجا فراخوانی میشه
      toast.success("محصول حذف شد");
      fetchCategories(); // بروزرسانی لیست بعد از حذف
    } catch (err) {
      console.error("خطا در حذف محصول:", err);
      toast.error("خطا در حذف محصول");
    }
  };

  // ریست کردن فرم
  useEffect(() => {
    if (!isCreateProductOpen) {
      setProductImageId(null);
      setUploadedImage(null);
      setImageSrc(null);
      reset();
    }
  }, [isCreateProductOpen, reset]);

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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === cat.id ? null : cat.id);
                    }}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <FiMoreVertical />
                  </button>

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

                        <p className="text-xs text-gray-500 ">
                          {p.finalPrice.toLocaleString()} تومان
                        </p>
                        <button
                          className=" top-9 right-0 text-red-500 text-xs hover:text-red-700"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          حذف
                        </button>
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

      {/* Dialog Create Product */}
      <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ثبت محصول در «{selectedCategory?.title}»</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onCreateProduct)} className="space-y-3">
            <Input
              className="text-left placeholder:text-right"
              placeholder="نام محصول"
              {...register("name", { required: "نام محصول الزامی است" })}
            />

            <Input
              type="number"
              className="text-left placeholder:text-right"
              placeholder="قیمت (تومان)"
              {...register("price", {
                required: "قیمت الزامی است",
                valueAsNumber: true,
              })}
            />

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
              className="text-left placeholder:text-right"
              placeholder="کالری (اختیاری)"
              {...register("calories", {
                valueAsNumber: true,
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
            />

            <Input
              type="number"
              className="text-left placeholder:text-right"
              placeholder="زمان آماده‌سازی (دقیقه)"
              {...register("averagePreparationMinutes", {
                valueAsNumber: true,
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
            />

            {/* hidden input for imageId */}
            <input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              className="hidden"
            />

            <div className="space-y-2">
              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="hidden"
              />

              <label
                htmlFor="product-image"
                className="w-23 h-23 border border-gray-300 rounded-xl
               flex flex-col items-center justify-center cursor-pointer
               hover:border-blue-500 hover:text-blue-500 transition
               bg-gray-50"
              >
                <MdOutlineAddPhotoAlternate size={36} />
              </label>
            </div>

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
                  type="button"
                  className="absolute bottom-2 left-2"
                  onClick={handleUploadCroppedImage}
                  disabled={uploading}
                >
                  {uploading ? "در حال آپلود..." : "تایید عکس"}
                </Button>
              </div>
            )}
            {uploadedImage && (
              <div className="flex items-center gap-2 mt-2">
                <Image
                  src={uploadedImage.url}
                  alt="uploaded"
                  width={48}
                  height={48}
                  className="rounded"
                />
                <button
                  type="button"
                  className="text-red-500 text-xs"
                  onClick={() => {
                    setUploadedImage(null);
                    setImageId(null);
                  }}
                >
                  حذف
                </button>
              </div>
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

      {/* Dialog Edit Category */}
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
