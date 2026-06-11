"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { PRODUCTS } from "@/lib/data";
import type { ProductListItem } from "@/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getProductListItem(product: (typeof PRODUCTS)[0]): ProductListItem {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    images: product.images,
    colors: product.colors,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    category: product.category,
  };
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results =
    query.length >= 2
      ? PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
        )
          .slice(0, 6)
          .map(getProductListItem)
      : [];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed left-1/2 top-[10%] z-50 w-full max-w-xl -translate-x-1/2 bg-[var(--background)] shadow-2xl",
          "transition-all duration-300",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={18} className="text-muted-foreground flex-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1" aria-label="Xóa">
              <X size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground border border-border px-2 py-1"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        {query.length >= 2 && (
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  {results.length} kết quả
                </p>
                <ul className="space-y-2">
                  {results.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/shop/${product.category}/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 hover:bg-dwarfs-surface rounded-sm transition-colors group"
                      >
                        <div className="flex-none w-12 h-16 bg-dwarfs-surface overflow-hidden">
                          {product.images[0] && (
                            <Image
                              src={product.images[0].url}
                              alt={product.images[0].alt}
                              width={48}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                        </div>
                        <ArrowRight
                          size={14}
                          className="flex-none text-muted-foreground group-hover:text-foreground transition-colors"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>

                {results.length >= 6 && (
                  <Link
                    href={`/shop?q=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="block mt-4 text-sm text-center underline-anim"
                  >
                    Xem tất cả kết quả
                  </Link>
                )}
              </>
            )}
          </div>
        )}

        {/* Empty state - trending */}
        {query.length < 2 && (
          <div className="p-4">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
              Tìm kiếm phổ biến
            </p>
            <div className="flex flex-wrap gap-2">
              {["Áo thun", "Sơ mi", "Quần linen", "New arrivals", "Sale"].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="text-xs border border-border px-3 py-1.5 hover:bg-dwarfs-dark hover:text-white hover:border-dwarfs-dark transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
