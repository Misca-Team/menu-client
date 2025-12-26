"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { updateCategory } from "@/app/services/request";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: { id: string; title: string; displayOrder?: number } | null;
  slug: string;
  onSuccess: () => void;
}

export default function EditCategoryDialog({
  open,
  onOpenChange,
  category,
  slug,
  onSuccess,
}: EditCategoryDialogProps) {
  const [title, setTitle] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setTitle(category.title);
      setDisplayOrder(category.displayOrder || 0);
    }
  }, [category]);

  const handleSave = async () => {
    if (!category) return;
    setLoading(true);
    try {
      await updateCategory(category.id, { title, order: displayOrder }, slug);
      toast.success("دسته‌بندی بروزرسانی شد");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("خطا در بروزرسانی دسته‌بندی:", err);
      toast.error("خطا در بروزرسانی دسته‌بندی");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ویرایش دسته‌بندی</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">عنوان</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ترتیب نمایش</label>
            <Input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
