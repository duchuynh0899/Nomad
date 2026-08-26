"use client";

import { useState } from "react";
import { Loader2, QrCode } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { createPaymentForOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/http";
import { cn } from "@/lib/utils";

export function RetryPaymentButton({ orderId }: { orderId: string }) {
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const { payment } = await authFetch((token) => createPaymentForOrder(token, orderId));
      window.location.href = payment.checkoutUrl;
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể tạo link thanh toán, thử lại sau", "error");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRetry}
      disabled={loading}
      className={cn("btn-primary flex items-center gap-2", loading && "opacity-70 cursor-not-allowed")}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
      {loading ? "Đang tạo link..." : "Thanh toán ngay"}
    </button>
  );
}
