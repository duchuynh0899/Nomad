import Link from "next/link";
import { getServerSession } from "next-auth";
import { Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { adminListOrders } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { ExportOrdersCsvButton } from "@/components/admin/ExportOrdersCsvButton";
import type { OrderStatus, RefundStatus } from "@/types/api";

interface SearchParams {
  status?: string;
  refundStatus?: string;
  orderNumber?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
}

const refundBadge: Record<RefundStatus, { label: string; className: string } | null> = {
  none: null,
  pending: { label: "Chờ hoàn tiền", className: "text-orange-600 bg-orange-50" },
  refunded: { label: "Đã hoàn tiền", className: "text-emerald-600 bg-emerald-50" },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;

  const filters = {
    status: sp.status as OrderStatus | undefined,
    refundStatus: sp.refundStatus as RefundStatus | undefined,
    orderNumber: sp.orderNumber || undefined,
    search: sp.search || undefined,
    dateFrom: sp.dateFrom || undefined,
    dateTo: sp.dateTo || undefined,
    page: sp.page ? Number(sp.page) : 1,
    limit: 30,
  };

  const { items: orders, meta } = await adminListOrders(accessToken, filters);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-medium">Đơn hàng ({meta.total})</h1>
        <div className="flex items-center gap-3">
          <ExportOrdersCsvButton filters={filters} />
          <Link href="/admin/orders/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Tạo đơn thủ công
          </Link>
        </div>
      </div>

      <form className="flex flex-wrap gap-3 mb-6" method="get">
        <input
          name="search"
          defaultValue={sp.search}
          placeholder="Tên hoặc SĐT người nhận..."
          className="border border-border px-3 py-2 text-sm bg-white w-56"
        />
        <input
          name="orderNumber"
          defaultValue={sp.orderNumber}
          placeholder="Mã đơn hàng"
          className="border border-border px-3 py-2 text-sm bg-white w-40"
        />
        <select name="status" defaultValue={sp.status ?? ""} className="border border-border px-3 py-2 text-sm bg-white">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="delivered">Hoàn tất</option>
          <option value="cancelled">Đã huỷ</option>
        </select>
        <select
          name="refundStatus"
          defaultValue={sp.refundStatus ?? ""}
          className="border border-border px-3 py-2 text-sm bg-white"
        >
          <option value="">Tất cả hoàn tiền</option>
          <option value="pending">Chờ hoàn tiền</option>
          <option value="refunded">Đã hoàn tiền</option>
        </select>
        <input type="date" name="dateFrom" defaultValue={sp.dateFrom} className="border border-border px-3 py-2 text-sm bg-white" />
        <input type="date" name="dateTo" defaultValue={sp.dateTo} className="border border-border px-3 py-2 text-sm bg-white" />
        <button type="submit" className="btn-outline text-sm px-4">
          Lọc
        </button>
      </form>

      <div className="bg-white border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="p-4">Mã đơn</th>
              <th className="p-4">Người nhận</th>
              <th className="p-4">Ngày</th>
              <th className="p-4">Tổng tiền</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">
                  <Link href={`/admin/orders/${o._id}`} className="underline-anim">
                    #{o.orderNumber}
                  </Link>
                </td>
                <td className="p-4">
                  {o.shippingAddress.recipientName} · {o.shippingAddress.phone}
                </td>
                <td className="p-4">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="p-4">{formatPrice(o.total)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <OrderStatusSelect orderId={o._id} status={o.status} />
                    {refundBadge[o.refundStatus] && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${refundBadge[o.refundStatus]!.className}`}
                      >
                        {refundBadge[o.refundStatus]!.label}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/orders/${o._id}`} className="text-xs underline-anim">
                    Chi tiết
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Không có đơn hàng nào khớp bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
