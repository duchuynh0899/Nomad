"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { adminUpdateOrderStatus } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/http";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/api";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã huỷ" },
];

const statusColor: Record<OrderStatus, string> = {
  pending: "text-orange-600 bg-orange-50",
  confirmed: "text-blue-600 bg-blue-50",
  shipping: "text-blue-600 bg-blue-50",
  delivered: "text-emerald-600 bg-emerald-50",
  cancelled: "text-red-600 bg-red-50",
};

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);

  const handleChange = async (next: OrderStatus) => {
    if (next === "pending" || next === current) return;
    setLoading(true);
    try {
      await authFetch((token) => adminUpdateOrderStatus(token, orderId, next));
      setCurrent(next);
      toast("Đã cập nhật trạng thái đơn hàng", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể chuyển trạng thái", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={current}
      disabled={loading || current === "delivered" || current === "cancelled"}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      className={cn(
        "text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70",
        statusColor[current]
      )}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value} disabled={o.value === "pending"}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
