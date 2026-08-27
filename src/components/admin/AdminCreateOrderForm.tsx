"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { VietnamAddressSelects } from "@/components/shared/VietnamAddressSelects";
import { adminListProducts } from "@/lib/api/products";
import { adminCreateOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/http";
import { formatPrice, cn } from "@/lib/utils";
import type { Product, ShippingAddress } from "@/types/api";

interface OrderLine {
  product: Product;
  variantId: string;
  quantity: number;
}

export function AdminCreateOrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState("");
  const [form, setForm] = useState<ShippingAddress & { note: string }>({
    recipientName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    addressLine: "",
    note: "",
  });
  const [couponCode, setCouponCode] = useState("");

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await authFetch((token) => adminListProducts(token, { search: search.trim(), limit: 10 }));
      setSearchResults(res.items);
    } catch {
      toast("Không thể tìm sản phẩm", "error");
    } finally {
      setSearching(false);
    }
  };

  const addLine = (product: Product, variantId: string) => {
    if (lines.some((l) => l.product._id === product._id && l.variantId === variantId)) return;
    setLines((prev) => [...prev, { product, variantId, quantity: 1 }]);
  };

  const updateQty = (idx: number, quantity: number) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, quantity: Math.max(1, quantity) } : l)));
  };

  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const subtotal = lines.reduce((sum, l) => {
    const variant = l.product.variants.find((v) => v.id === l.variantId);
    return sum + (variant ? l.product.price * l.quantity : 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      toast("Vui lòng thêm ít nhất 1 sản phẩm", "error");
      return;
    }
    setSaving(true);
    try {
      const { recipientName, phone, province, district, ward, addressLine } = form;
      const order = await authFetch((token) =>
        adminCreateOrder(token, {
          userId: userId || undefined,
          items: lines.map((l) => ({ productId: l.product._id, variantId: l.variantId, quantity: l.quantity })),
          shippingAddress: { recipientName, phone, province, district, ward, addressLine },
          note: form.note || undefined,
          couponCode: couponCode || undefined,
        })
      );
      toast(`Đã tạo đơn #${order.orderNumber}`, "success");
      router.push(`/admin/orders/${order._id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Tạo đơn thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Sản phẩm */}
      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-3 block">Sản phẩm</label>
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              placeholder="Tìm sản phẩm theo tên..."
              className="w-full border border-border pl-8 pr-3 py-2 text-sm bg-white"
            />
          </div>
          <button type="button" onClick={handleSearch} disabled={searching} className="btn-outline text-sm px-4">
            {searching ? <Loader2 size={14} className="animate-spin" /> : "Tìm"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="border border-border divide-y divide-border mb-4 max-h-64 overflow-y-auto">
            {searchResults.map((p) => (
              <div key={p._id} className="p-3">
                <p className="text-sm font-medium mb-2">
                  {p.name} · {formatPrice(p.price)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.variants.map((v) => (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => v.id && addLine(p, v.id)}
                      disabled={v.stock === 0}
                      className={cn(
                        "text-xs border border-border px-2 py-1 hover:border-dwarfs-dark transition-colors",
                        v.stock === 0 && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {v.sku} · {v.color}/{v.size} · tồn {v.stock}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border border-border">
          {lines.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">Chưa có sản phẩm nào trong đơn.</p>
          ) : (
            <ul className="divide-y divide-border">
              {lines.map((l, idx) => {
                const variant = l.product.variants.find((v) => v.id === l.variantId);
                return (
                  <li key={`${l.product._id}-${l.variantId}`} className="flex items-center gap-3 p-3 text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{l.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {variant?.sku} · {variant?.color}/{variant?.size}
                      </p>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={variant?.stock}
                      value={l.quantity}
                      onChange={(e) => updateQty(idx, Number(e.target.value))}
                      className="w-16 border border-border px-2 py-1 text-sm"
                    />
                    <span className="w-24 text-right">{formatPrice(l.product.price * l.quantity)}</span>
                    <button type="button" onClick={() => removeLine(idx)} className="p-1 text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {lines.length > 0 && (
          <p className="text-sm font-medium text-right mt-2">Tạm tính: {formatPrice(subtotal)}</p>
        )}
      </div>

      {/* Khách hàng */}
      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
          User ID (tuỳ chọn — để trống nếu là khách vãng lai)
        </label>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="665f..."
          className="w-full border border-border px-3 py-2.5 text-sm bg-white font-mono"
        />
      </div>

      {/* Địa chỉ giao hàng */}
      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-3 block">Địa chỉ giao hàng</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.recipientName}
            onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
            placeholder="Họ tên người nhận"
            className="border border-border px-3 py-2 text-sm bg-white"
          />
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Số điện thoại"
            className="border border-border px-3 py-2 text-sm bg-white"
          />
          <VietnamAddressSelects
            province={form.province}
            district={form.district}
            ward={form.ward}
            onChange={(next) => setForm((f) => ({ ...f, ...next }))}
            showLabels={false}
            selectClassName="border border-border px-3 py-2 text-sm bg-white w-full"
            provinceWrapperClassName="col-span-2"
          />
          <input
            value={form.addressLine}
            onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
            placeholder="Địa chỉ cụ thể"
            className="border border-border px-3 py-2 text-sm bg-white col-span-2"
          />
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Mã giảm giá (tuỳ chọn)"
            className="border border-border px-3 py-2 text-sm bg-white uppercase"
          />
          <textarea
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="Ghi chú (vd: Đặt qua điện thoại)"
            rows={2}
            className="border border-border px-3 py-2 text-sm bg-white col-span-2 resize-none"
          />
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Đang tạo đơn..." : "Tạo đơn hàng"}
      </button>
    </form>
  );
}
