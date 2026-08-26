"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, XCircle, Clock } from "lucide-react";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { getMyOrder } from "@/lib/api/orders";
import { OrderDetail } from "@/components/order/OrderDetail";
import { RetryPaymentButton } from "@/components/account/RetryPaymentButton";
import type { Order } from "@/types";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 8; // ~15s tổng, theo khuyến nghị ở API_REFERENCE.md mục 7.1

function PaymentResultContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const status = searchParams.get("status"); // "success" | "cancel"
  const { authFetch } = useAuthFetch();

  const [order, setOrder] = useState<Order | null>(null);
  const [polling, setPolling] = useState(status === "success");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const fetchOrder = async () => {
      try {
        const result = await authFetch((token) => getMyOrder(token, params.id));
        if (cancelled) return;
        setOrder(result);

        if (status === "success" && result.paymentStatus !== "paid" && attempts < MAX_POLLS) {
          attempts += 1;
          setTimeout(fetchOrder, POLL_INTERVAL_MS);
        } else {
          setPolling(false);
        }
      } catch {
        if (!cancelled) {
          setError("Không thể tải thông tin đơn hàng.");
          setPolling(false);
        }
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, status]);

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-red-500">{error}</p>
        <Link href="/account" className="btn-outline mt-6 inline-block">
          Xem đơn hàng của tôi
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isPaid = order.paymentStatus === "paid";
  const isCancelFlow = status === "cancel";

  return (
    <div>
      <div className="text-center mb-10">
        {isPaid ? (
          <>
            <CheckCircle size={56} className="mx-auto text-green-500 mb-6" />
            <h1 className="text-2xl font-medium mb-3">Thanh toán thành công!</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Cảm ơn bạn đã mua sắm tại Nomad. Đơn hàng #{order.orderNumber} đã được ghi nhận thanh toán.
            </p>
          </>
        ) : isCancelFlow ? (
          <>
            <XCircle size={56} className="mx-auto text-red-500 mb-6" />
            <h1 className="text-2xl font-medium mb-3">Đã huỷ thanh toán</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Bạn đã huỷ giao dịch. Đơn hàng #{order.orderNumber} vẫn được giữ lại — bạn có thể thanh toán lại
              bất cứ lúc nào.
            </p>
          </>
        ) : polling ? (
          <>
            <Clock size={56} className="mx-auto text-orange-500 mb-6 animate-pulse" />
            <h1 className="text-2xl font-medium mb-3">Đang xác nhận thanh toán...</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Vui lòng chờ trong giây lát, hệ thống đang xác nhận với PayOS.
            </p>
          </>
        ) : (
          <>
            <Clock size={56} className="mx-auto text-orange-500 mb-6" />
            <h1 className="text-2xl font-medium mb-3">Chưa xác nhận được thanh toán</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nếu bạn đã thanh toán xong, hệ thống có thể cần thêm chút thời gian để cập nhật — hãy thử tải lại
              trang này sau ít phút.
            </p>
          </>
        )}
      </div>

      <div className="border-t border-border pt-8">
        <OrderDetail order={order} />
        {!isPaid && !polling && order.status !== "cancelled" && (
          <div className="mt-6 flex justify-center">
            <RetryPaymentButton orderId={order._id} />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
        <Link href="/account" className="btn-outline">
          Xem đơn hàng của tôi
        </Link>
        <Link href="/" className="btn-primary">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        }
      >
        <PaymentResultContent />
      </Suspense>
    </div>
  );
}
