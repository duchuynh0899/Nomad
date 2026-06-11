"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/wishlist-store";
import { ProductGrid } from "@/components/product/ProductGrid";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);

  return (
    <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 border-b border-border pb-8">
        <h1 className="text-3xl font-medium tracking-tight">Danh sách yêu thích</h1>
        <p className="mt-2 text-sm text-muted-foreground">{items.length} sản phẩm</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart size={48} className="text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium">Chưa có sản phẩm yêu thích</p>
          <p className="text-sm text-muted-foreground mt-2 mb-8">
            Nhấn vào biểu tượng trái tim để lưu sản phẩm bạn thích
          </p>
          <Link href="/shop" className="btn-primary">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
