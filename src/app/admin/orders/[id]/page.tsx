import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { adminGetOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/http";
import { OrderDetail } from "@/components/order/OrderDetail";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { RefundOrderButton } from "@/components/admin/RefundOrderButton";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;

  let order;
  try {
    order = await adminGetOrder(accessToken, id);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) notFound();
    throw err;
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft size={16} /> Quay lại danh sách đơn hàng
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-medium">Chi tiết đơn hàng</h1>
        <OrderStatusSelect orderId={order._id} status={order.status} />
      </div>

      <div className="bg-white border border-border p-6">
        <OrderDetail order={order} />
      </div>

      {order.refundStatus === "pending" && (
        <div className="mt-6">
          <RefundOrderButton orderId={order._id} />
        </div>
      )}
    </div>
  );
}
