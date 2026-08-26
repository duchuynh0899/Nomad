import { apiFetch, buildQuery } from "./http";
import type {
  Coupon,
  CouponInput,
  CouponValidateResult,
  FeaturedCoupon,
  PaginatedResult,
} from "@/types/api";

export function validateCoupon(code: string, subtotal: number) {
  return apiFetch<CouponValidateResult>("/coupons/validate", {
    method: "POST",
    body: { code, subtotal },
  });
}

// Coupon công khai để hiển thị banner/quảng cáo — không cần đăng nhập.
export function listFeaturedCoupons() {
  return apiFetch<FeaturedCoupon[]>("/coupons/featured");
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function adminListCoupons(
  token: string,
  params: { isActive?: boolean; page?: number; limit?: number } = {}
) {
  return apiFetch<PaginatedResult<Coupon>>(`/admin/coupons${buildQuery(params)}`, { token });
}

export function adminCreateCoupon(token: string, input: CouponInput) {
  return apiFetch<Coupon>("/admin/coupons", { method: "POST", token, body: input });
}

export function adminUpdateCoupon(token: string, id: string, input: Partial<CouponInput>) {
  return apiFetch<Coupon>(`/admin/coupons/${id}`, { method: "PATCH", token, body: input });
}

export function adminDeleteCoupon(token: string, id: string) {
  return apiFetch<void>(`/admin/coupons/${id}`, { method: "DELETE", token });
}
