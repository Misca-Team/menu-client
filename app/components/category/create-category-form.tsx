"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { createCategory } from "@/app/services/request";
import { useParams } from "next/navigation";
import { FaPlus } from "react-icons/fa6";
import { FormCreateCategoryProps } from "@/app/types/interfaces";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categorySchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  displayOrder: z.coerce.number().int().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CreateCategoryForm({
  onSuccess,
}: FormCreateCategoryProps) {
  const [open, setOpen] = useState(false);
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      title: "",
      displayOrder: 0,
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    if (!slug) {
      toast.error("شناسه کسب‌وکار نامعتبر است");
      return;
    }

    try {
      await createCategory({
        ...data,
        displayOrder: data.displayOrder ?? 0,
        slug,
      });
      toast.success("دسته‌بندی با موفقیت ایجاد شد");
      setOpen(false);
      reset();
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "خطایی رخ داد");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand text-sm cursor-pointer flex items-center text-white px-4 py-2 rounded-md hover:bg-brand-400 transition-colors">
          <FaPlus size={13} className="mr-2" />
          جدید
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>دسته‌بندی جدید</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">عنوان</label>
            <Input placeholder="مثلاً قهوه" {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-xs">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">اولویت</label>
            <Input
              type="number"
              placeholder="مثلاً 0"
              {...register("displayOrder", { valueAsNumber: true })}
            />
            {errors.displayOrder && (
              <p className="text-red-500 text-xs">
                {errors.displayOrder.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              لغو
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "در حال افزودن..." : "افزودن"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
