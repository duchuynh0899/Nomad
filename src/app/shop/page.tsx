"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

function ShopContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? undefined;
  const filter = searchParams.get("filter"); // "new" | "sale"

  const { products, page, totalPages, isLoading, error, goToPage } = useProducts({
    search: q,
    sort: "newest",
    limit: 24,
  });

  const displayProducts = filter === "sale" ? products.filter((p) => p.originalPrice) : products;

  const title = q
    ? `Kết quả cho "${q}"`
    : filter === "new"
      ? "New Arrivals"
      : filter === "sale"
        ? "Sale"
        : "Tất cả sản phẩm";

  return (
    <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 border-b border-border pb-8">
        <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {isLoading ? "Đang tải..." : `${displayProducts.length} sản phẩm`}
        </p>
      </div>

      {error && <p className="text-sm text-red-500 mb-6">{error}</p>}

      {isLoading ? (
        <ProductGridSkeleton count={12} />
      ) : (
        <>
          <ProductGrid products={displayProducts} />

          {totalPages > 1 && filter !== "sale" && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={cn(
                    "w-9 h-9 text-sm border transition-colors",
                    p === page
                      ? "bg-dwarfs-dark text-white border-dwarfs-dark"
                      : "border-border hover:border-dwarfs-dark"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm text-muted-foreground">Đang tải...</div>}>
      <ShopContent />
    </Suspense>
  );
}
