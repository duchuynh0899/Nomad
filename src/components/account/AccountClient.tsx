"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import type { Session } from "next-auth";
import { User, Package, MapPin, LogOut, ChevronRight, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { updateMe } from "@/lib/api/users";
import { listMyOrders } from "@/lib/api/orders";
import type { Order, OrderStatus } from "@/types/api";

type Tab = "profile" | "orders" | "addresses";

const statusLabel: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Hoàn tất",
  cancelled: "Đã huỷ",
};

const statusColor: Record<OrderStatus, string> = {
  pending: "text-orange-600 bg-orange-50",
  confirmed: "text-blue-600 bg-blue-50",
  shipping: "text-blue-600 bg-blue-50",
  delivered: "text-emerald-600 bg-emerald-50",
  cancelled: "text-red-600 bg-red-50",
};

interface AccountClientProps {
  user: Session["user"];
}

export function AccountClient({ user }: AccountClientProps) {
  const [tab, setTab] = useState<Tab>("profile");

  const tabs = [
    { id: "profile" as const, label: "Thông tin tài khoản", icon: User },
    { id: "orders" as const, label: "Đơn hàng của tôi", icon: Package },
    { id: "addresses" as const, label: "Sổ địa chỉ", icon: MapPin },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10 pb-8 border-b border-border">
        <div className="w-14 h-14 rounded-full bg-dwarfs-surface flex items-center justify-center text-lg font-medium flex-none">
          {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "N"}
        </div>
        <div>
          <p className="font-medium">{user?.name ?? "Khách hàng"}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
        {/* Sidebar */}
        <nav className="space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors",
                  tab === t.id
                    ? "bg-dwarfs-dark text-white"
                    : "hover:bg-dwarfs-surface"
                )}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left text-red-500 hover:bg-red-50 transition-colors mt-4"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </nav>

        {/* Content */}
        <div>
          {tab === "profile" && <ProfileTab user={user} />}
          {tab === "orders" && <OrdersTab />}
          {tab === "addresses" && <AddressesTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ user }: { user: Session["user"] }) {
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authFetch((token) => updateMe(token, { name, phone: phone || undefined }));
      toast("Đã cập nhật thông tin tài khoản", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Có lỗi xảy ra", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-6">Thông tin tài khoản</h2>
      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
            Họ tên
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-dwarfs-dark"
          />
        </div>

        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
            Email
          </label>
          <input
            type="email"
            value={user?.email ?? ""}
            disabled
            className="w-full border border-border px-3 py-2.5 text-sm bg-dwarfs-surface text-muted-foreground"
          />
        </div>

        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0987654321"
            className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-dwarfs-dark"
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}

function OrdersTab() {
  const { authFetch } = useAuthFetch();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch((token) => listMyOrders(token))
      .then((res) => setOrders(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải đơn hàng"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (!orders) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" /> Đang tải đơn hàng...
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-6">Đơn hàng của tôi</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/account/orders/${order._id}`}
              className="flex items-center justify-between border border-border p-4 hover:border-dwarfs-dark transition-colors"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-medium">#{order.orderNumber}</span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      statusColor[order.status]
                    )}
                  >
                    {statusLabel[order.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")} · {order.items.length} sản phẩm
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{formatPrice(order.total)}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressesTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Sổ địa chỉ</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Sổ địa chỉ chưa được hỗ trợ ở backend — địa chỉ giao hàng được nhập trực tiếp mỗi lần đặt hàng ở
        bước thanh toán.
      </p>
    </div>
  );
}
