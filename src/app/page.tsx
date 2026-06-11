import type { Metadata } from "next";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { CategorySection } from "@/components/product/CategorySection";
import { CATEGORIES, PRODUCTS, getProductListItem } from "@/lib/data";

export const metadata: Metadata = {
  title: "Nomad – Thời trang tối giản",
};

export default function HomePage() {
  const aoProducts = PRODUCTS.filter((p) => p.category === "ao").map(getProductListItem);
  const quanProducts = PRODUCTS.filter((p) => p.category === "quan").map(getProductListItem);

  const aoCategory = CATEGORIES.find((c) => c.slug === "ao")!;
  const quanCategory = CATEGORIES.find((c) => c.slug === "quan")!;

  return (
    <>
      <HeroBanner />

      <div className="space-y-16 pb-24">
        <CategorySection
          category={aoCategory}
          products={aoProducts}
          viewAllHref="/shop/ao"
        />

        <CategorySection
          category={quanCategory}
          products={quanProducts}
          viewAllHref="/shop/quan"
        />
      </div>
    </>
  );
}
