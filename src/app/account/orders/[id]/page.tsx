import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getMyOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/http";
import { OrderDetail } from "@/components/order/OrderDetail";
import { CancelOrderButton } from "@/components/account/CancelOrderButton";
import { RetryPaymentButton } from "@/components/account/RetryPaymentButton";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng",
};

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const accessToken = session?.accessToken;
  if (!accessToken) redirect("/login");

  let order;
  try {
    order = await getMyOrder(accessToken, id);
  } catch (err) {
    if (err instanceof ApiError && (err.statusCode === 404 || err.statusCode === 403)) {
      notFound();
    }
    throw err;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ChevronLeft size={16} /> Quay lại tài khoản
      </Link>

      <OrderDetail order={order} />

      <div className="mt-6 flex gap-3">
        {order.paymentMethod === "payos" &&
          order.paymentStatus === "unpaid" &&
          order.status !== "cancelled" && <RetryPaymentButton orderId={order._id} />}
        {order.status === "pending" && <CancelOrderButton orderId={order._id} />}
      </div>
    </div>
  );
}
