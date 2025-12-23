"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { PiBagSimpleBold } from "react-icons/pi";
import { IoIosAt } from "react-icons/io";
import { AiOutlineUpload } from "react-icons/ai";
import Cropper from "react-easy-crop";
import { uploadCroppedImage, createBusiness } from "../services/request";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CroppedArea, UploadedImage } from "../types/interfaces";
import { useRouter } from "next/navigation";
import { getDefaultLogoFile } from "../helpers/defaultImage";

// Validation Schema
// Validation Schema
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

type CreateBusinessForm = {
  name: string;
  slug: string;
  logoId?: string | null;
  logoTypographyId?: string | null;
  vatPercentage: number;
  roundingStrategy: number;
  locationId?: string | null;
  seoId?: string | null;
};

//Typing Placeholder Hook
function useTypingPlaceholder(words: string[], speed = 120, delay = 1200) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && text.length < currentWord.length) {
      timeout = setTimeout(() => {
        setText(currentWord.slice(0, text.length + 1));
      }, speed);
    } else if (isDeleting && text.length > 0) {
      timeout = setTimeout(() => {
        setText(currentWord.slice(0, text.length - 1));
      }, speed / 2);
    } else if (!isDeleting && text.length === currentWord.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, delay);
    } else if (isDeleting && text.length === 0) {
      timeout = setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length);
        setIsDeleting(false);
      }, 0);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, speed, delay]);

  return text;
}

// Crop Image Utility
const getCroppedImg = (
  imageSrc: string,
  pixelCrop: CroppedArea
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    image.onload = () => {
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };

    image.onerror = (err) => reject(err);
  });
};

// Logo Crop Modal Component
interface LogoCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedPixels: CroppedArea) => Promise<void>;
}

function LogoCropModal({ imageSrc, onClose, onSave }: LogoCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CroppedArea | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = (croppedArea: any, croppedPixels: CroppedArea) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsSaving(true);
    try {
      await onSave(croppedAreaPixels);
      onClose();
    } catch (error) {
      console.error("Error saving cropped image:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md w-full max-w-md h-[500px] relative p-4 flex flex-col">
        <div className="flex-1 relative">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="rect"
          />
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={handleSave}
            disabled={isSaving || !croppedAreaPixels}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                در حال پردازش...
              </>
            ) : (
              "ثبت"
            )}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Form Component
export default function CreateForm() {
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
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // برای ریدایرکت کاربر بعد از ساخت کسب و کار
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateBusinessForm>({
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
  const roundingStrategy = watch("roundingStrategy");

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

  const handleSaveCropped = async (croppedPixels: CroppedArea) => {
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
      console.log("API Response:", response);

      if (response.isSuccess && response.data.length > 0) {
        const imageData = response.data[0];
        const uploadedImageData: UploadedImage = {
          id: imageData.id,
          url: imageData.url,
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
      setSubmitError(
        "خطا در آپلود لوگو: " + (error.message || "خطای ناشناخته")
      );
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

  const onSubmit = async (data: CreateBusinessForm) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      let finalLogoId = data.logoId;

      // گذاشتن عکس پیش فرض
      if (!finalLogoId) {
        setIsUploading(true);

        const defaultFile = await getDefaultLogoFile();
        const uploadRes = await uploadCroppedImage(defaultFile);

        if (uploadRes.isSuccess && uploadRes.data.length > 0) {
          finalLogoId = uploadRes.data[0].id;

          // ست کردن در فرم برای هماهنگی state
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
        locationId: data.locationId || null,
        seoId: data.seoId || null,
      };
      // @ts-ignore
      const response = await createBusiness(payload);
      console.log("Business created successfully:", response);

      setSubmitSuccess(true);
      router.push("/workspace/business");

      setTimeout(() => {
        setSubmitSuccess(false);
        setUploadedImage(null);
        setCroppedImage(null);
        setLogoName("");
        setValue("name", "");
        setValue("slug", "");
        setValue("vatPercentage", 0);
        setValue("roundingStrategy", 0);
        setValue("logoId", null);
      }, 3000);
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
        className="w-full max-w-122.5 h-fit border border-gray-300 rounded-md overflow-hidden bg-white"
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

        {submitSuccess && (
          <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            کسب‌وکار با موفقیت ایجاد شد!
          </div>
        )}

        {/* Business Type */}
        <div className="flex flex-col mt-5 p-4 gap-2">
          <label className="text-[15.4px] text-body">نوع کسب و کار</label>
          <input
            disabled
            className="bg-[#f9f3f3] p-1.5 text-[14px] rounded-md outline-none cursor-not-allowed"
            type="text"
            defaultValue="کافه"
          />
        </div>

        {/* Brand Name */}
        <div className="flex flex-col mt-1 p-4 gap-2">
          <label className="text-[15.4px] text-body">نام</label>
          <input
            placeholder="نام برند"
            className={`p-1.5 text-[14px] rounded-md outline-none border ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            type="text"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Unique ID */}
        <div className="flex flex-col mt-1 p-4 gap-2">
          <label className="text-[15.4px] text-body">شناسه یکتا</label>
          <div className="flex items-center w-full">
            <input
              placeholder={brandPlaceholder.replace(/\s/g, "-")}
              className={`p-1.5 text-[14px] w-full rounded-md placeholder:text-[14px] placeholder:text-left placeholder:pl-2 rounded-l-none outline-none border ${
                errors.slug ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              {...register("slug")}
            />
            <div className="border h-[34.3px] w-9 rounded-md rounded-r-none border-gray-300 flex items-center justify-center bg-[#F8F9FA]">
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

            {/* Preview کوچک و مربع */}
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
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                {...register("vatPercentage", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" || Number.isNaN(v) ? 0 : v),
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

          {/* Rounding Strategy */}
          {/* <div className="flex flex-col mt-3 gap-2">
            <label className="text-[15.4px] text-body">
              استراتژی رند کردن قیمت
            </label>
            <select
              className="p-1.5 text-[14px] rounded-md outline-none border border-gray-300"
              {...register("roundingStrategy", { valueAsNumber: true })}
            >
              <option value="0">هیچ (بدون رند کردن)</option>
              <option value="1">به بالا</option>
              <option value="2">به پایین</option>
              <option value="3">نزدیک‌ترین عدد</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {roundingStrategy === 0 &&
                "قیمت‌ها بدون تغییر نمایش داده می‌شوند"}
              {roundingStrategy === 1 && "قیمت‌ها به عدد بالاتر رند می‌شوند"}
              {roundingStrategy === 2 && "قیمت‌ها به عدد پایین‌تر رند می‌شوند"}
              {roundingStrategy === 3 &&
                "قیمت‌ها به نزدیک‌ترین عدد رند می‌شوند"}
            </p>
          </div> */}

          <div className="border-b border-gray-300 my-3"></div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="bg-[#7977E5] w-full mb-2 p-[10.5px] rounded-sm cursor-pointer text-white hover:bg-[#7472ce] transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                در حال ایجاد...
              </>
            ) : (
              "ایجاد کسب‌وکار"
            )}
          </button>
        </div>
      </form>

      {/* Crop Modal */}
      {imageSrc && (
        <LogoCropModal
          imageSrc={imageSrc}
          onClose={() => setImageSrc(null)}
          onSave={handleSaveCropped}
        />
      )}
    </div>
  );
}
