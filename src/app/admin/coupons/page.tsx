import Link from "next/link";
import { getServerSession } from "next-auth";
import { Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { adminListCoupons } from "@/lib/api/coupons";
import { formatPrice } from "@/lib/utils";
import { DeleteCouponButton } from "@/components/admin/DeleteCouponButton";

export default async function AdminCouponsPage() {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;
  const { items: coupons, meta } = await adminListCoupons(accessToken, { limit: 100 });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-medium">Mã giảm giá ({meta.total})</h1>
        <Link href="/admin/coupons/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Thêm mã giảm giá
        </Link>
      </div>

      <div className="bg-white border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="p-4">Mã</th>
              <th className="p-4">Giá trị</th>
              <th className="p-4">Đơn tối thiểu</th>
              <th className="p-4">Đã dùng</th>
              <th className="p-4">Hết hạn</th>
              <th className="p-4">Hiển thị</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium font-mono">{c.code}</td>
                <td className="p-4">
                  {c.type === "percent" ? `${c.value}%` : formatPrice(c.value)}
                  {c.maxDiscount ? ` (tối đa ${formatPrice(c.maxDiscount)})` : ""}
                </td>
                <td className="p-4">{c.minOrderValue ? formatPrice(c.minOrderValue) : "—"}</td>
                <td className="p-4">
                  {c.usedCount ?? 0}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="p-4">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("vi-VN") : "Không giới hạn"}
                </td>
                <td className="p-4">
                  {c.isPublic ? (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-blue-600 bg-blue-50">
                      Công khai
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-muted-foreground bg-dwarfs-surface">
                      Riêng tư
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {c.isActive ? (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-emerald-600 bg-emerald-50">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-muted-foreground bg-dwarfs-surface">
                      Tắt
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/coupons/${c._id}/edit`} className="text-xs underline-anim">
                      Sửa
                    </Link>
                    <DeleteCouponButton couponId={c._id} code={c.code} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
