"use client";

import { ProductCard } from "@/components/product/ProductCard";
import type { ProductListItem } from "@/types";

interface ProductGridProps {
  products: ProductListItem[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium">Không có sản phẩm nào</p>
        <p className="text-sm text-muted-foreground mt-2">
          Hãy thử thay đổi bộ lọc hoặc xem danh mục khác
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
