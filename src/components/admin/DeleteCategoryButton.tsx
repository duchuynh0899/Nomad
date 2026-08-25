"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { adminDeleteCategory } from "@/lib/api/categories";
import { ApiError } from "@/lib/api/http";

export function DeleteCategoryButton({ categoryId, categoryName }: { categoryId: string; categoryName: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Xoá danh mục "${categoryName}"? Hành động này không thể hoàn tác.`)) return;
    setLoading(true);
    try {
      await authFetch((token) => adminDeleteCategory(token, categoryId));
      toast("Đã xoá danh mục", "success");
      router.refresh();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Xoá thất bại — danh mục có thể vẫn còn sản phẩm",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="text-xs text-red-500 underline-anim disabled:opacity-50">
      {loading ? "Đang xoá..." : "Xoá"}
    </button>
  );
}
