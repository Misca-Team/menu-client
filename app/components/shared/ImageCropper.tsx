import { useState } from "react";
import Cropper from "react-easy-crop";
import { CroppedArea } from "@/app/types/interfaces";

interface ImageCropperProps {
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedPixels: CroppedArea) => Promise<void>;
  loading?: boolean;
}

export function ImageCropper({
  imageSrc,
  onClose,
  onSave,
  loading = false,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CroppedArea | null>(null);

  const onCropComplete = (_: any, croppedPixels: CroppedArea) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    await onSave(croppedAreaPixels);
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
            disabled={loading || !croppedAreaPixels}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
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
            disabled={loading}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

// Utility to crop image
export const getCroppedImg = (
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
