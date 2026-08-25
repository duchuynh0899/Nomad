"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { cancelMyOrder } from "@/lib/api/orders";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Huỷ đơn hàng này? Hành động này không thể hoàn tác.")) return;
    setLoading(true);
    try {
      await authFetch((token) => cancelMyOrder(token, orderId));
      toast("Đã huỷ đơn hàng", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Huỷ đơn thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleCancel} disabled={loading} className="btn-outline text-sm disabled:opacity-50">
      {loading ? "Đang huỷ..." : "Huỷ đơn hàng"}
    </button>
  );
}
