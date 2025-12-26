"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { PiBagSimpleBold } from "react-icons/pi";
import { IoIosAt } from "react-icons/io";
import { AiOutlineUpload } from "react-icons/ai";
import { uploadCroppedImage, createBusiness } from "@/app/services/request";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UploadedImage } from "@/app/types/interfaces";
import { useRouter } from "next/navigation";
import { getDefaultLogoFile } from "@/app/helpers/defaultImage";
import { useTypingPlaceholder } from "@/app/hooks/useTypingPlaceholder";
import {
  ImageCropper,
  getCroppedImg,
} from "@/app/components/shared/ImageCropper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const businessSchema = z.object({
  name: z.string().min(1, "نام کسب‌وکار الزامی است"),
  slug: z
    .string()
    .min(1, "شناسه یکتا الزامی است")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "فقط حروف انگلیسی، اعداد، خط تیره، نقطه و آندرلاین مجاز است"
    ),
  logoId: z.string().nullable().optional(),
  logoTypographyId: z.string().nullable().optional(),
  vatPercentage: z
    .number()
    .min(0, "درصد مالیات نمی‌تواند منفی باشد")
    .max(100, "درصد مالیات نمی‌تواند بیش از ۱۰۰ باشد"),
  roundingStrategy: z.number().min(0).max(3),
  locationId: z.string().nullable().optional(),
  seoId: z.string().nullable().optional(),
});

type CreateBusinessFormValues = z.infer<typeof businessSchema>;

export default function CreateBusinessForm() {
  const brandPlaceholder = useTypingPlaceholder([
    "brand_name",
    "my_business_name",
    "my-brand-3",
    "_coffeee_name_",
    "x_name_x",
  ]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [logoName, setLogoName] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateBusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      slug: "",
      logoId: null,
      logoTypographyId: null,
      vatPercentage: 0,
      roundingStrategy: 0,
      locationId: null,
      seoId: null,
    },
  });

  const vatPercentage = watch("vatPercentage");

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
      setLogoName(file.name);
    }
  };

  const handleSaveCropped = async (croppedPixels: any) => {
    if (!imageSrc || !croppedPixels) return;

    setIsUploading(true);
    try {
      const croppedBase64 = await getCroppedImg(imageSrc, croppedPixels);

      const res = await fetch(croppedBase64);
      const blob = await res.blob();

      const file = new File([blob], logoName || "cropped-image.jpg", {
        type: "image/jpeg",
      });

      const response = await uploadCroppedImage(file);

      if (response.isSuccess && response.data.length > 0) {
        const imageData = response.data[0];
        const uploadedImageData: UploadedImage = {
          id: imageData.id,
          url: imageData.filePath || "", // Adjusted to match UploadResponse type
        };

        setUploadedImage(uploadedImageData);
        setCroppedImage(croppedBase64);
        setValue("logoId", imageData.id);
        setImageSrc(null);
        setSubmitError(null);
      } else {
        throw new Error("آپلود لوگو ناموفق بود");
      }
    } catch (error: any) {
      console.error("Error cropping/uploading image:", error);
      toast.error("خطا در آپلود لوگو: " + (error.message || "خطای ناشناخته"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setCroppedImage(null);
    setLogoName("");
    setValue("logoId", null);
    setSubmitError(null);
  };

  const onSubmit = async (data: CreateBusinessFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let finalLogoId = data.logoId;

      if (!finalLogoId) {
        setIsUploading(true);

        const defaultFile = await getDefaultLogoFile();
        const uploadRes = await uploadCroppedImage(defaultFile);

        if (uploadRes.isSuccess && uploadRes.data.length > 0) {
          finalLogoId = uploadRes.data[0].id;
          setValue("logoId", finalLogoId);
        } else {
          throw new Error("آپلود لوگوی پیش‌فرض ناموفق بود");
        }

        setIsUploading(false);
      }

      const payload = {
        ...data,
        logoId: finalLogoId,
        logoTypographyId: data.logoTypographyId || null,
        locationId: null,
        seoId: null,
        roundingStrategy: data.roundingStrategy as 0 | 1 | 2,
      };

      await createBusiness(payload);

      toast.success("کسب‌وکار با موفقیت ایجاد شد!");
      router.push("/workspace/business");
    } catch (error: any) {
      console.error("Error creating business:", error);

      if (
        error.response?.status === 400 &&
        error.response?.data?.messages?.[0] === "شناسه کسب و کار تکراری است."
      ) {
        setSubmitError(
          "این شناسه قبلاً استفاده شده است. لطفاً یک شناسه یکتا وارد کنید."
        );
      } else {
        setSubmitError(
          error.response?.data?.message ||
            error.message ||
            "خطا در ایجاد کسب‌وکار"
        );
      }
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full flex justify-center lg:justify-start px-3 lg:px-0">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-122.5 h-fit border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center gap-1 border-b p-3 border-gray-300 bg-[#F8F8F8]">
          <PiBagSimpleBold size={20} />
          <h3 className="text-[17.5px] font-bold">کسب و کار جدید</h3>
        </div>

        {/* Messages */}
        {submitError && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {submitError}
          </div>
        )}

        {/* Business Type */}
        <div className="flex flex-col mt-5 p-4 gap-2">
          <label className="text-[15.4px] text-body">نوع کسب و کار</label>
          <Input disabled value="کافه" className="bg-[#f9f3f3]" />
        </div>

        {/* Brand Name */}
        <div className="flex flex-col mt-1 p-4 gap-2">
          <label className="text-[15.4px] text-body">نام</label>
          <Input
            placeholder="نام برند"
            {...register("name")}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Unique ID */}
        <div className="flex flex-col mt-1 p-4 gap-2">
          <label className="text-[15.4px] text-body">شناسه یکتا</label>
          <div className="flex items-center w-full">
            <Input
              placeholder={brandPlaceholder.replace(/\s/g, "-")}
              {...register("slug")}
              className={`rounded-l-none border-l-0 ${
                errors.slug ? "border-red-500" : ""
              }`}
            />
            <div className="border h-9 w-9 rounded-md rounded-r-none border-gray-300 border-r-0 flex items-center justify-center bg-[#F8F9FA]">
              <IoIosAt />
            </div>
          </div>
          {errors.slug && (
            <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
          )}
          <label className="text-[13.5px] text-[#212529BF]">
            کارکترهای مجاز: اعداد | حروف انگلیسی | _ | - و .
          </label>

          {/* Logo Upload */}
          <div className="flex flex-col mt-3 gap-2">
            <label className="text-[15.4px] text-body">لوگو</label>
            <div
              onClick={handleUploadClick}
              className={`relative cursor-pointer border ${
                isUploading ? "border-blue-500" : "border-gray-400"
              } rounded-md h-10 w-full hover:bg-gray-50 flex items-center justify-center transition-colors`}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></span>
                  <span className="text-sm">در حال آپلود...</span>
                </div>
              ) : (
                <>
                  <AiOutlineUpload size={22} />
                  {logoName && !croppedImage && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[13px] text-gray-600 truncate max-w-[85%]">
                      {logoName}
                    </span>
                  )}
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />

            {/* Preview */}
            {croppedImage && (
              <div className="mt-2 flex items-center gap-3">
                <div className="relative">
                  <img
                    src={croppedImage}
                    alt="Logo Preview"
                    className="h-16 w-16 object-cover rounded-md border border-gray-300"
                  />
                  {uploadedImage && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      ✓
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 truncate max-w-[200px]">
                    آپلود شده: {uploadedImage?.id ? "بله" : "خیر"}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-2 py-1 text-sm text-red-600 border border-red-400 rounded-md hover:bg-red-50 transition-colors"
                    disabled={isUploading}
                  >
                    حذف
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* VAT Percentage */}
          <div className="flex flex-col mt-3 gap-2">
            <label className="text-[15.4px] text-body">
              درصد مالیات بر ارزش افزوده
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                {...register("vatPercentage", {
                  valueAsNumber: true,
                })}
              />

              <span className="text-gray-600">%</span>
            </div>
            {errors.vatPercentage && (
              <p className="text-red-500 text-sm mt-1">
                {errors.vatPercentage.message}
              </p>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(vatPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="border-b border-gray-300 my-3"></div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="bg-[#7977E5] w-full mb-2 hover:bg-[#7472ce] text-white"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                در حال ساخت...
              </>
            ) : (
              "ایجاد کسب و کار"
            )}
          </Button>
        </div>
      </form>

      {imageSrc && (
        <ImageCropper
          imageSrc={imageSrc}
          onClose={() => setImageSrc(null)}
          onSave={handleSaveCropped}
          loading={isUploading}
        />
      )}
    </div>
  );
}
