import Link from "next/link";
import { getServerSession } from "next-auth";
import { Package, ShoppingBag, DollarSign, AlertTriangle, RotateCcw } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { adminGetDashboardSummary } from "@/lib/api/dashboard";
import { formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Hoàn tất",
  cancelled: "Đã huỷ",
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days } = await searchParams;
  const rangeDays = days ? Number(days) : 30;

  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;
  const summary = await adminGetDashboardSummary(accessToken, { days: rangeDays });

  const cards = [
    { label: `Doanh thu ${summary.rangeDays} ngày qua`, value: formatPrice(summary.revenue), icon: DollarSign },
    { label: `Đơn hàng ${summary.rangeDays} ngày qua`, value: summary.ordersInRange, icon: ShoppingBag },
    {
      label: "Đơn đang chờ xử lý",
      value: (summary.ordersByStatus.pending ?? 0) + (summary.ordersByStatus.confirmed ?? 0),
      icon: Package,
    },
    { label: "Sắp hết hàng", value: summary.lowStock.length, icon: AlertTriangle },
    { label: "Chờ hoàn tiền", value: summary.pendingRefunds, icon: RotateCcw, href: "/admin/orders?refundStatus=pending" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-medium">Tổng quan</h1>
        <form method="get" className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Khoảng thời gian:</label>
          <select name="days" defaultValue={rangeDays} className="border border-border px-2 py-1.5 text-sm bg-white">
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={90}>90 ngày</option>
          </select>
          <button type="submit" className="btn-outline text-xs px-3 py-1.5">
            Áp dụng
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <Icon size={16} className="text-muted-foreground" />
              </div>
              <p className="text-2xl font-medium">{card.value}</p>
            </>
          );
          return card.href ? (
            <Link key={card.label} href={card.href} className="bg-white border border-border p-5 hover:border-dwarfs-dark transition-colors">
              {content}
            </Link>
          ) : (
            <div key={card.label} className="bg-white border border-border p-5">
              {content}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-border p-5">
          <h2 className="text-sm font-medium mb-4">Đơn hàng theo trạng thái</h2>
          <ul className="space-y-2 text-sm">
            {Object.entries(summary.ordersByStatus).map(([status, count]) => (
              <li key={status} className="flex justify-between">
                <span className="text-muted-foreground">{STATUS_LABEL[status] ?? status}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-border p-5">
          <h2 className="text-sm font-medium mb-4">Bán chạy nhất</h2>
          {summary.bestSellers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {summary.bestSellers.map((p) => (
                <li key={p._id} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-muted-foreground">
                    {p.quantitySold} sp · {formatPrice(p.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Sắp hết hàng</h2>
          <Link href="/admin/products" className="text-xs underline-anim">
            Xem tất cả sản phẩm
          </Link>
        </div>
        {summary.lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có biến thể nào sắp hết hàng.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="py-2">Sản phẩm</th>
                <th className="py-2">SKU</th>
                <th className="py-2">Màu / Size</th>
                <th className="py-2 text-right">Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {summary.lowStock.map((item, idx) => (
                <tr key={`${item._id}-${item.sku}-${idx}`} className="border-b border-border last:border-0">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2 font-mono text-xs">{item.sku}</td>
                  <td className="py-2">
                    {item.color} / {item.size}
                  </td>
                  <td className="py-2 text-right text-orange-600 font-medium">{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
