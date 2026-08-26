// components/admin/DeleteProductButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { adminDeleteProduct } from "@/lib/api/products";
import { ApiError } from "@/lib/api/http";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Ẩn sản phẩm "${productName}"? Sản phẩm sẽ không còn hiển thị ở cửa hàng.`)) return;

    setLoading(true);
    try {
      await authFetch((token) => adminDeleteProduct(token, productId));
      toast("Đã ẩn sản phẩm", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Xoá thất bại, thử lại sau", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 underline-anim disabled:opacity-50"
    >
      {loading ? "Đang xoá..." : "Ẩn"}
    </button>
  );
}
