"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { createProduct, uploadCroppedImage } from "@/app/services/request";
import { UploadedImage } from "@/app/types/interfaces";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ImageCropper,
  getCroppedImg,
} from "@/app/components/shared/ImageCropper";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import Image from "next/image";

const productSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  price: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  isAvailable: z.boolean().default(true),
  calories: z.coerce.number().nullable().optional(),
  averagePreparationMinutes: z.coerce.number().nullable().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface CreateProductFormProps {
  categoryId: string;
  slug: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateProductForm({
  categoryId,
  slug,
  onSuccess,
  onCancel,
}: CreateProductFormProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      price: 0,
      isAvailable: true,
      calories: null,
      averagePreparationMinutes: null,
    },
  });

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCropped = async (croppedPixels: any) => {
    if (!imageSrc) return;
    setUploading(true);
    try {
      const croppedBase64 = await getCroppedImg(imageSrc, croppedPixels);
      const res = await fetch(croppedBase64);
      const blob = await res.blob();
      const file = new File([blob], "product.jpg", { type: "image/jpeg" });

      const response = await uploadCroppedImage(file);
      if (response.isSuccess && response.data.length > 0) {
        const image = response.data[0];
        setUploadedImage({ id: image.id, url: image.filePath || "" });
        setImageSrc(null);
        toast.success("عکس با موفقیت آپلود شد");
      } else {
        throw new Error("آپلود عکس ناموفق بود");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("خطا در آپلود عکس");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!uploadedImage) {
      toast.error("لطفاً ابتدا عکس را آپلود کنید");
      return;
    }

    try {
      await createProduct(
        {
          ...data,
          categoryId,
          imageId: uploadedImage.id,
          isAvailable: data.isAvailable ?? true,
        },
        slug
      );
      toast.success("محصول با موفقیت ثبت شد");
      onSuccess();
    } catch (err) {
      console.error("Create product error:", err);
      toast.error("خطا در ثبت محصول");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1">
          <Input
            placeholder="نام محصول"
            {...register("name")}
            className={`text-auto ${errors.name ? "border-red-500" : ""}`}
            style={{ textAlign: "start" }}
            dir="auto"
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            type="text"
            placeholder="قیمت (تومان)"
            {...register("price", { valueAsNumber: true })}
            className={`text-left placeholder:text-right ${errors.price ? "border-red-500" : ""}`}
            dir="ltr"
            value={""}
          />
          {errors.price && (
            <p className="text-red-500 text-xs">{errors.price.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            {...register("isAvailable")}
            className="accent-brand w-4 h-4"
          />
          موجود است
        </label>

        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="کالری (اختیاری)"
            {...register("calories", {
              valueAsNumber: true,
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
            className="text-left placeholder:text-right"
            dir="ltr"
          />
          <Input
            type="number"
            placeholder="زمان آماده‌سازی (دقیقه)"
            {...register("averagePreparationMinutes", {
              valueAsNumber: true,
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
            className="text-left placeholder:text-right"
            dir="ltr"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="hidden"
          />

          {!uploadedImage && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl
               flex flex-col items-center justify-center cursor-pointer
               hover:border-blue-500 hover:text-blue-500 transition
               bg-gray-50 text-gray-400"
            >
              <MdOutlineAddPhotoAlternate size={32} />
              <span className="text-xs mt-1">افزودن عکس محصول</span>
            </div>
          )}

          {uploadedImage && (
            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <div className="relative w-16 h-16">
                <Image
                  src={uploadedImage.url}
                  alt="uploaded"
                  fill
                  className="rounded object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-600">
                  عکس آپلود شد
                </p>
                <button
                  type="button"
                  className="text-red-500 text-xs hover:underline mt-1"
                  onClick={() => {
                    setUploadedImage(null);
                    setImageSrc(null);
                  }}
                >
                  حذف و آپلود مجدد
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            انصراف
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "در حال ثبت..." : "ثبت محصول"}
          </Button>
        </div>
      </form>

      {imageSrc && (
        <ImageCropper
          imageSrc={imageSrc}
          onClose={() => setImageSrc(null)}
          onSave={handleSaveCropped}
          loading={uploading}
        />
      )}
    </div>
  );
}
