import { listBanners } from "@/lib/api/banners";
import { HeroBannerCarousel } from "./HeroBannerCarousel";

export async function HeroBanner() {
  const banners = await listBanners().catch(() => []);
  return <HeroBannerCarousel banners={banners} />;
}
