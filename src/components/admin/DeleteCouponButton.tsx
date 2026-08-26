"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { adminDeleteCoupon } from "@/lib/api/coupons";
import { ApiError } from "@/lib/api/http";

export function DeleteCouponButton({ couponId, code }: { couponId: string; code: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Xoá mã "${code}"? Hành động này không thể hoàn tác.`)) return;
    setLoading(true);
    try {
      await authFetch((token) => adminDeleteCoupon(token, couponId));
      toast("Đã xoá mã giảm giá", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Xoá thất bại", "error");
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
