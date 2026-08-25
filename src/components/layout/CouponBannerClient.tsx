"use client";

import { useState } from "react";
import { Tag, Copy, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { FeaturedCoupon } from "@/types";

function describeCoupon(c: FeaturedCoupon): string {
  const amount = c.type === "percent" ? `${c.value}%` : formatPrice(c.value);
  let text = `Giảm ${amount}`;
  if (c.type === "percent" && c.maxDiscount) text += ` (tối đa ${formatPrice(c.maxDiscount)})`;
  if (c.minOrderValue) text += ` cho đơn từ ${formatPrice(c.minOrderValue)}`;
  return text;
}

function CouponPill({ coupon }: { coupon: FeaturedCoupon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API không khả dụng (vd http không secure) — bỏ qua, khách tự chọn/copy mã.
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 whitespace-nowrap hover:opacity-80 transition-opacity"
      title="Bấm để sao chép mã"
    >
      <Tag size={12} className="flex-none" />
      <span>
        {describeCoupon(coupon)} — mã{" "}
        <span className="font-semibold tracking-wide underline decoration-dotted">{coupon.code}</span>
      </span>
      {copied ? <Check size={12} className="flex-none" /> : <Copy size={12} className="flex-none opacity-70" />}
    </button>
  );
}

export function CouponBannerClient({ coupons }: { coupons: FeaturedCoupon[] }) {
  if (coupons.length === 0) return null;

  return (
    <div className="bg-dwarfs-dark text-dwarfs-light text-xs">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-6 overflow-x-auto scrollbar-hide">
        {coupons.map((c) => (
          <CouponPill key={c.code} coupon={c} />
        ))}
      </div>
    </div>
  );
}
