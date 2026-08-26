"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { adminRefundOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/http";

export function RefundOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const [loading, setLoading] = useState(false);

  const handleRefund = async () => {
    const note = window.prompt(
      "Ghi chú hoàn tiền (vd: đã chuyển khoản qua Momo, mã GD...) — để trống nếu không cần:"
    );
    if (note === null) return; // bấm Cancel
    setLoading(true);
    try {
      await authFetch((token) => adminRefundOrder(token, orderId, note || undefined));
      toast("Đã đánh dấu hoàn tiền", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể đánh dấu hoàn tiền", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleRefund} disabled={loading} className="btn-outline text-sm disabled:opacity-50">
      {loading ? "Đang xử lý..." : "Đánh dấu đã hoàn tiền"}
    </button>
  );
}
