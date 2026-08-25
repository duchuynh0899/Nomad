import { HeroBanner } from "@/components/layout/HeroBanner";
import { CategorySection } from "@/components/product/CategorySection";
import { listCategories } from "@/lib/api/categories";
import { listProducts } from "@/lib/api/products";

// Không khai báo metadata riêng — trang chủ dùng đúng `title.default` + `description` của root layout
// (đặt template ở đây sẽ bị nhân đôi "Nomad" do layout đã có title.template).

const SECTIONS_LIMIT = 3;
const PRODUCTS_PER_SECTION = 8;

export default async function HomePage() {
  const categories = await listCategories().catch(() => []);
  // Quần là dòng chủ lực của shop — luôn hiển thị trước tiên trên trang chủ.
  const sortedCategories = [...categories].sort(
    (a, b) => Number(b.slug === "quan") - Number(a.slug === "quan")
  );
  const sections = sortedCategories.slice(0, SECTIONS_LIMIT);

  const sectionsData = await Promise.all(
    sections.map(async (category) => {
      const res = await listProducts({ category: category._id, limit: PRODUCTS_PER_SECTION }).catch(
        () => null
      );
      return { category, products: res?.items ?? [], total: res?.meta.total ?? 0 };
    })
  );

  return (
    <>
      <HeroBanner />

      <div className="space-y-16 pb-24">
        {sectionsData
          .filter((s) => s.products.length > 0)
          .map((s) => (
            <CategorySection
              key={s.category._id}
              category={s.category}
              products={s.products}
              productCount={s.total}
              viewAllHref={`/shop/${s.category.slug}`}
            />
          ))}
      </div>
    </>
  );
}
