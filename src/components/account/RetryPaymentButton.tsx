"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, QrCode, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { createPaymentForOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/http";
import { cn } from "@/lib/utils";
import { PayosEmbeddedCheckout } from "@/components/checkout/PayosEmbeddedCheckout";

export function RetryPaymentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const { payment } = await authFetch((token) => createPaymentForOrder(token, orderId));
      setCheckoutUrl(payment.checkoutUrl);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể tạo link thanh toán, thử lại sau", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleRetry}
        disabled={loading}
        className={cn("btn-primary flex items-center gap-2", loading && "opacity-70 cursor-not-allowed")}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
        {loading ? "Đang tạo link..." : "Thanh toán ngay"}
      </button>

      {checkoutUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white max-w-md w-full p-5 space-y-3 relative">
            <button
              onClick={() => setCheckoutUrl(null)}
              className="absolute top-3 right-3 p-1 hover:bg-dwarfs-surface"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
            <h3 className="text-sm font-medium tracking-widest uppercase">Thanh toán đơn hàng</h3>
            <PayosEmbeddedCheckout
              checkoutUrl={checkoutUrl}
              returnUrl={`${window.location.origin}/orders/${orderId}/payment-result?status=success`}
              onSuccess={() => router.push(`/orders/${orderId}/payment-result?status=success`)}
              onCancel={() => setCheckoutUrl(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
