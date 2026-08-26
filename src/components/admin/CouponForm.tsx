"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { adminCreateCoupon, adminUpdateCoupon } from "@/lib/api/coupons";
import { ApiError } from "@/lib/api/http";
import type { Coupon, CouponType } from "@/types/api";

export function CouponForm({ initialData }: { initialData?: Coupon }) {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const isEdit = !!initialData;

  const [code, setCode] = useState(initialData?.code ?? "");
  const [type, setType] = useState<CouponType>(initialData?.type ?? "percent");
  const [value, setValue] = useState(initialData?.value?.toString() ?? "");
  const [maxDiscount, setMaxDiscount] = useState(initialData?.maxDiscount?.toString() ?? "");
  const [minOrderValue, setMinOrderValue] = useState(initialData?.minOrderValue?.toString() ?? "");
  const [usageLimit, setUsageLimit] = useState(initialData?.usageLimit?.toString() ?? "");
  const [expiresAt, setExpiresAt] = useState(
    initialData?.expiresAt ? initialData.expiresAt.slice(0, 10) : ""
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: code.toUpperCase(),
        type,
        value: Number(value),
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        isActive,
        isPublic,
      };
      if (isEdit && initialData) {
        await authFetch((token) => adminUpdateCoupon(token, initialData._id, payload));
        toast("Đã cập nhật mã giảm giá", "success");
      } else {
        await authFetch((token) => adminCreateCoupon(token, payload));
        toast("Đã tạo mã giảm giá", "success");
      }
      router.push("/admin/coupons");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Có lỗi xảy ra", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Mã coupon</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          className="w-full border border-border px-3 py-2.5 text-sm bg-white font-mono uppercase"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Loại giảm giá</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CouponType)}
            className="w-full border border-border px-3 py-2.5 text-sm bg-white"
          >
            <option value="percent">Phần trăm (%)</option>
            <option value="fixed">Số tiền cố định (VND)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
            Giá trị {type === "percent" ? "(%)" : "(VND)"}
          </label>
          <input
            type="number"
            min={0}
            max={type === "percent" ? 100 : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            className="w-full border border-border px-3 py-2.5 text-sm bg-white"
          />
        </div>
      </div>

      {type === "percent" && (
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
            Giảm tối đa (VND, tuỳ chọn)
          </label>
          <input
            type="number"
            min={0}
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            className="w-full border border-border px-3 py-2.5 text-sm bg-white"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
            Đơn tối thiểu (VND)
          </label>
          <input
            type="number"
            min={0}
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            className="w-full border border-border px-3 py-2.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Giới hạn lượt dùng</label>
          <input
            type="number"
            min={0}
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            className="w-full border border-border px-3 py-2.5 text-sm bg-white"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Ngày hết hạn</label>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full border border-border px-3 py-2.5 text-sm bg-white"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Đang hoạt động (active)
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Công khai (hiển thị ở banner trang chủ)
          <br />
          <span className="text-xs text-muted-foreground">
            Bỏ chọn nếu mã chỉ gửi riêng cho khách (email/Zalo) — khách vẫn dùng được nếu biết mã,
            chỉ không hiển thị công khai.
          </span>
        </span>
      </label>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mã giảm giá"}
      </button>
    </form>
  );
}
