import { listFeaturedCoupons } from "@/lib/api/coupons";
import { getShippingSettings } from "@/lib/api/settings";
import { CouponBannerClient } from "./CouponBannerClient";

export async function CouponBanner() {
  const [coupons, shipping] = await Promise.all([
    listFeaturedCoupons().catch(() => []),
    getShippingSettings().catch(() => null),
  ]);
  const freeShippingThreshold = shipping?.freeShippingThreshold;

  if (coupons.length === 0 && !freeShippingThreshold) return null;
  return <CouponBannerClient coupons={coupons} freeShippingThreshold={freeShippingThreshold} />;
}
