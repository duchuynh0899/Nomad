import { listFeaturedCoupons } from "@/lib/api/coupons";
import { CouponBannerClient } from "./CouponBannerClient";

export async function CouponBanner() {
  const coupons = await listFeaturedCoupons().catch(() => []);
  if (coupons.length === 0) return null;
  return <CouponBannerClient coupons={coupons} />;
}
