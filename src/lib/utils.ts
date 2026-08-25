import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price) + " đ";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function getDiscountPercent(price: number, originalPrice: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Giá hiển thị chuẩn hoá — LUÔN dùng effectivePrice làm giá bán chính (đúng số tiền lúc checkout).
// Ưu tiên flash sale (salePrice/isOnSale, có hạn) hơn originalPrice (mốc giá tĩnh admin tự nhập,
// không hết hạn) — 2 cơ chế giảm giá độc lập, không cộng dồn hiển thị.
export function getPriceDisplay(product: {
  price: number;
  originalPrice?: number;
  effectivePrice: number;
  isOnSale: boolean;
}): { current: number; compareAt?: number; discountPercent?: number } {
  if (product.isOnSale) {
    return {
      current: product.effectivePrice,
      compareAt: product.price,
      discountPercent: getDiscountPercent(product.effectivePrice, product.price),
    };
  }
  if (product.originalPrice && product.originalPrice > product.effectivePrice) {
    return {
      current: product.effectivePrice,
      compareAt: product.originalPrice,
      discountPercent: getDiscountPercent(product.effectivePrice, product.originalPrice),
    };
  }
  return { current: product.effectivePrice };
}
