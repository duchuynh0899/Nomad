import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { Category, ProductListItem } from "@/types";

interface CategorySectionProps {
  category: Category;
  products: ProductListItem[];
  viewAllHref: string;
  productCount: number;
}

export function CategorySection({ category, products, viewAllHref, productCount }: CategorySectionProps) {
  return (
    <section className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-2xl font-medium tracking-tight">{category.name.toUpperCase()}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-xl leading-relaxed line-clamp-2">
          {category.description}
          {" "}
          <Link href={viewAllHref} className="underline-anim font-medium text-foreground">
            Đọc thêm
          </Link>
        </p>
      </div>

      {/* Grid sản phẩm - 2 cột trên mobile, 3 cột trên tablet, 4 cột trên desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* View all link - chỉ hiển thị khi danh mục có nhiều hơn số sản phẩm đang xem trước */}
      {productCount > products.length && (
        <div className="mt-8 text-center">
          <Link
            href={viewAllHref}
            className="btn-outline inline-block"
          >
            Xem tất cả {category.name.toLowerCase()} ({productCount})
          </Link>
        </div>
      )}
    </section>
  );
}
