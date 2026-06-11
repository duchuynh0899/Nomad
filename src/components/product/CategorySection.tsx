"use client";

import { useRef, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";
import type { Category, ProductListItem } from "@/types";

interface CategorySectionProps {
  category: Category;
  products: ProductListItem[];
  viewAllHref: string;
}

export function CategorySection({ category, products, viewAllHref }: CategorySectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  // Register event listener
  if (emblaApi) {
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
      {/* Section header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium tracking-tight">{category.name.toUpperCase()}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-xl leading-relaxed line-clamp-2">
            {category.description}
            {" "}
            <Link href={viewAllHref} className="underline-anim font-medium text-foreground">
              Đọc thêm
            </Link>
          </p>
        </div>

        {/* Nav arrows - desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(
              "w-9 h-9 flex items-center justify-center border border-border transition-colors",
              canScrollPrev
                ? "hover:bg-dwarfs-dark hover:text-white hover:border-dwarfs-dark"
                : "opacity-30 cursor-not-allowed"
            )}
            aria-label="Sản phẩm trước"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(
              "w-9 h-9 flex items-center justify-center border border-border transition-colors",
              canScrollNext
                ? "hover:bg-dwarfs-dark hover:text-white hover:border-dwarfs-dark"
                : "opacity-30 cursor-not-allowed"
            )}
            aria-label="Sản phẩm tiếp"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.333%-12px)] lg:w-[calc(25%-12px)]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* View all link */}
      <div className="mt-8 text-center">
        <Link
          href={viewAllHref}
          className="btn-outline inline-block"
        >
          Xem tất cả {category.name.toLowerCase()} ({category.productCount})
        </Link>
      </div>
    </section>
  );
}
