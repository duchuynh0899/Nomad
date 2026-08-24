"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { useToast } from "@/components/ui/Toast";
import { useCartStore } from "@/lib/cart-store";
import { cn, formatPrice, getDiscountPercent } from "@/lib/utils";
import { useWishlistStore } from "@/lib/wishlist-store";
import type {
  Product,
  ProductColor,
  ProductListItem,
  ProductSize,
} from "@/types";
import DOMPurify from "isomorphic-dompurify";
import { Heart, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductDetailClientProps {
  product: Product;
  related: ProductListItem[];
}

export function ProductDetailClient({
  product,
  related,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors[0],
  );
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isWishlisted } = useWishlistStore();
  const { toast } = useToast();
  const wishlisted = isWishlisted(product.id);

  const productAsListItem: ProductListItem = {
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

  const getVariant = (color: ProductColor, size: ProductSize) => {
    return product.variants.find(
      (v) => v.color.slug === color.slug && v.size === size,
    );
  };

  const currentVariant = selectedSize
    ? getVariant(selectedColor, selectedSize)
    : undefined;

  const isSizeAvailable = (size: ProductSize) => {
    const variant = getVariant(selectedColor, size);
    return variant ? variant.stock > 0 : false;
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    if (!currentVariant) return;

    addItem(productAsListItem, currentVariant, quantity);
    toast(`Đã thêm ${product.name} vào giỏ hàng`, "success");
  };

  console.log(product.images[selectedImage]?.url);

  const sanitizedInfo = DOMPurify.sanitize(product?.information);

  return (
    <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground underline-anim">
          Trang chủ
        </Link>
        <span>/</span>
        <Link
          href={`/shop/${product.category}`}
          className="hover:text-foreground underline-anim capitalize"
        >
          {product.category === "ao"
            ? "Áo"
            : product.category === "quan"
              ? "Quần"
              : "Phụ kiện"}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative aspect-[3/4] bg-dwarfs-surface overflow-hidden">
            <Image
              src={product.images[selectedImage]?.url ?? product.images[0].url}
              alt={product.images[selectedImage]?.alt ?? product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />

            {product.isNew && <span className="badge-new">New</span>}
            {product.originalPrice && (
              <span className="badge-sale">
                -{getDiscountPercent(product.price, product.originalPrice)}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative w-16 aspect-[3/4] bg-dwarfs-surface overflow-hidden border-2 transition-colors",
                    selectedImage === idx
                      ? "border-dwarfs-dark"
                      : "border-transparent",
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="lg:py-4">
          <div className="space-y-6">
            {/* Name & price */}
            <div>
              {product.isBestSeller && (
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  Best Seller
                </p>
              )}
              <h1 className="text-2xl font-medium tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xl font-medium">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Color selector */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase mb-3">
                Màu sắc:{" "}
                <span className="font-normal normal-case text-muted-foreground">
                  {selectedColor.name}
                </span>
              </p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.slug}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      selectedColor.slug === color.slug
                        ? "border-dwarfs-dark scale-110"
                        : "border-transparent hover:border-border",
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p
                  className={cn(
                    "text-xs font-medium tracking-widest uppercase",
                    sizeError && "text-red-500",
                  )}
                >
                  {sizeError ? "Vui lòng chọn size" : "Kích thước"}
                </p>
                <Link
                  href="/huong-dan-chon-size"
                  className="text-xs text-muted-foreground underline-anim"
                >
                  Hướng dẫn chọn size
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const available = isSizeAvailable(size);
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      disabled={!available}
                      className={cn(
                        "min-w-[3rem] px-3 py-2 text-sm border transition-all",
                        selectedSize === size
                          ? "bg-dwarfs-dark text-white border-dwarfs-dark"
                          : available
                            ? "border-border hover:border-dwarfs-dark"
                            : "border-border text-muted-foreground/40 cursor-not-allowed line-through",
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {currentVariant && currentVariant.stock <= 3 && (
                <p className="text-xs text-orange-600 mt-2">
                  Chỉ còn {currentVariant.stock} sản phẩm
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase mb-3">
                Số lượng
              </p>
              <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 hover:bg-dwarfs-surface transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2.5 text-sm min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={
                    currentVariant ? quantity >= currentVariant.stock : false
                  }
                  className="px-3 py-2.5 hover:bg-dwarfs-surface transition-colors disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} className="btn-primary flex-1">
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={() => toggleItem(productAsListItem)}
                className={cn(
                  "p-3 border transition-all",
                  wishlisted
                    ? "bg-dwarfs-dark text-white border-dwarfs-dark"
                    : "border-border hover:border-dwarfs-dark",
                )}
                aria-label={
                  wishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"
                }
              >
                <Heart size={18} className={wishlisted ? "fill-current" : ""} />
              </button>
            </div>

            {/* Product details */}
            <div className="space-y-4 border-t border-border pt-6">
              <div className="border-t border-border pt-6">
                <div
                  className="prose prose-sm max-w-none text-muted-foreground [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2"
                  dangerouslySetInnerHTML={{ __html: sanitizedInfo }}
                />
              </div>
              <div>
                <p className="text-xs font-medium tracking-widest uppercase mb-2">
                  Mô tả
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {product.material && (
                <div>
                  <p className="text-xs font-medium tracking-widest uppercase mb-2">
                    Chất liệu
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.material}
                  </p>
                </div>
              )}

              {product.care && product.care.length > 0 && (
                <div>
                  <p className="text-xs font-medium tracking-widest uppercase mb-2">
                    Hướng dẫn bảo quản
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {product.care.map((instruction, i) => (
                      <li key={i}>· {instruction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20 border-t border-border pt-12">
          <h2 className="text-lg font-medium mb-8">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
