"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { cn, formatPrice, getDiscountPercent } from "@/lib/utils";
import { useWishlistStore } from "@/lib/wishlist-store";
import type { ProductListItem } from "@/types";

interface ProductCardProps {
  product: ProductListItem;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { toggleItem, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const primaryImage = product.images[0];
  const hoverImage = product.images[1];

  return (
    <article className={cn("group product-card relative", className)}>
      {/* Image container */}
      <Link href={`/shop/${product.category}/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-dwarfs-surface overflow-hidden img-zoom">
          {primaryImage && (
            <Image
              unoptimized
              src={primaryImage?.url}
              alt={primaryImage.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-opacity duration-500",
                hoverImage && "group-hover:opacity-0"
              )}
            />
          )}

          {hoverImage && (
            <Image
              src={hoverImage.url}
              alt={hoverImage.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 absolute inset-0"
            />
          )}

          {/* Badges */}
          {product.isNew && !product.originalPrice && (
            <span className="badge-new">New</span>
          )}
          {product.originalPrice && (
            <span className="badge-sale">
              -{getDiscountPercent(product.price, product.originalPrice)}%
            </span>
          )}

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleItem(product);
            }}
            className={cn(
              "absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full",
              "transition-all duration-200 hover:scale-110",
              "product-actions"
            )}
            aria-label={wishlisted ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
          >
            <Heart
              size={16}
              className={cn(
                "transition-colors",
                wishlisted ? "fill-red-500 stroke-red-500" : "stroke-foreground"
              )}
            />
          </button>
        </div>
      </Link>

      {/* Product info */}
      <div className="mt-3 space-y-1">
        <Link
          href={`/shop/${product.category}/${product.slug}`}
          className="block text-sm font-medium leading-tight hover:underline"
        >
          {product.name}
        </Link>

        {/* Colors */}
        {product.colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {product.colors.map((color) => (
              <span
                key={color.slug}
                className="inline-block w-3 h-3 rounded-full border border-border"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-xs text-muted-foreground">+{product.colors.length - 3}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
