import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getMyOrder } from "@/lib/api/orders";
import { OrderDetail } from "@/components/order/OrderDetail";
import { RetryPaymentButton } from "@/components/account/RetryPaymentButton";

export const metadata: Metadata = {
  title: "Đặt hàng thành công",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const accessToken = session?.accessToken as string | undefined;
  const order = orderId && accessToken ? await getMyOrder(accessToken, orderId).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center mb-10">
        <CheckCircle size={56} className="mx-auto text-green-500 mb-6" />
        <h1 className="text-2xl font-medium mb-3">Đặt hàng thành công!</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Cảm ơn bạn đã mua sắm tại Nomad. Chúng tôi sẽ liên hệ để xác nhận đơn hàng của bạn.
        </p>
      </div>

      {order ? (
        <div className="border-t border-border pt-8">
          <OrderDetail order={order} />
          {order.paymentMethod === "payos" && order.paymentStatus === "unpaid" && (
            <div className="mt-6 flex justify-center">
              <RetryPaymentButton orderId={order._id} />
            </div>
          )}
        </div>
      ) : (
        orderId && (
          <p className="text-center text-sm text-muted-foreground mb-6">
            Không thể tải chi tiết đơn hàng ngay lúc này, nhưng đơn của bạn đã được ghi nhận.
          </p>
        )
      )}

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
