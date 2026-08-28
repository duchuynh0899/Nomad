"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { useToast } from "@/components/ui/Toast";
import { useCartStore } from "@/lib/cart-store";
import { cn, formatPrice, getPriceDisplay } from "@/lib/utils";
import { useWishlistStore } from "@/lib/wishlist-store";
import type { Product, ProductColor, ProductListItem } from "@/types";
import DOMPurify from "isomorphic-dompurify";
import { Heart, Minus, Plus, RotateCcw, Tag, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductDetailClientProps {
  product: Product;
  related: ProductListItem[];
}

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isWishlisted } = useWishlistStore();
  const { toast } = useToast();
  const wishlisted = isWishlisted(product._id);

  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));

  const getVariant = (color: ProductColor | undefined, size: string) => {
    if (!color) return undefined;
    return product.variants.find((v) => v.color === color.slug && v.size === size);
  };

  const currentVariant = selectedSize ? getVariant(selectedColor, selectedSize) : undefined;

  const isSizeAvailable = (size: string) => {
    const variant = getVariant(selectedColor, size);
    return variant ? variant.stock > 0 : false;
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    if (!currentVariant || !selectedColor) return;

    addItem(product, currentVariant, quantity);
    toast(`Đã thêm ${product.name} vào giỏ hàng`, "success");
  };

  const sanitizedInfo = DOMPurify.sanitize(product.information ?? "");
  const priceDisplay = getPriceDisplay(product);

  return (
    <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground underline-anim">
          Trang chủ
        </Link>
        <span>/</span>
        <Link
          href={`/shop/${product.category.slug}`}
          className="hover:text-foreground underline-anim capitalize"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <div className="lg:flex lg:items-start lg:gap-3">
          {/* Thumbnails — hàng ngang dưới ảnh trên mobile, cột dọc bên trái ảnh trên desktop
              (để chọn ảnh không cần cuộn xuống khi ảnh chính cao). */}
          {product.images.length > 1 && (
            <div className="order-2 mt-3 flex gap-2 overflow-x-auto lg:order-1 lg:mt-0 lg:max-h-[640px] lg:w-20 lg:flex-none lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
              {product.images.map((img, idx) => (
                <button
                  key={img.publicId || idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative w-16 aspect-[3/4] flex-none bg-dwarfs-surface overflow-hidden border-2 transition-colors lg:w-full",
                    selectedImage === idx ? "border-dwarfs-dark" : "border-transparent"
                  )}
                >
                  <Image src={img.url} alt={img.alt ?? product.name} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="relative order-1 aspect-[3/4] flex-1 bg-dwarfs-surface overflow-hidden lg:order-2">
            {product.images[selectedImage] && (
              <Image
                src={product.images[selectedImage].url}
                alt={product.images[selectedImage].alt ?? product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            )}

            {priceDisplay.discountPercent !== undefined && (
              <span className="badge-sale">-{priceDisplay.discountPercent}%</span>
            )}
          </div>
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
              <h1 className="text-2xl font-medium tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xl font-medium">{formatPrice(priceDisplay.current)}</span>
                {priceDisplay.compareAt !== undefined && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(priceDisplay.compareAt)}
                  </span>
                )}
              </div>
              {product.isOnSale && product.saleEndAt && (
                <p className="mt-2 text-xs text-red-600">
                  Giá sale áp dụng đến {new Date(product.saleEndAt).toLocaleString("vi-VN")}
                </p>
              )}
            </div>

            {/* Color selector */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-xs font-medium tracking-widest uppercase mb-3">
                  Màu sắc:{" "}
                  <span className="font-normal normal-case text-muted-foreground">
                    {selectedColor?.name}
                  </span>
                </p>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.slug}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedSize(null);
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        selectedColor?.slug === color.slug
                          ? "border-dwarfs-dark scale-110"
                          : "border-transparent hover:border-border"
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      aria-label={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p
                  className={cn(
                    "text-xs font-medium tracking-widest uppercase",
                    sizeError && "text-red-500"
                  )}
                >
                  {sizeError ? "Vui lòng chọn size" : "Kích thước"}
                </p>
                <Link href="/huong-dan-chon-size" className="text-xs text-muted-foreground underline-anim">
                  Hướng dẫn chọn size
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
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
                            : "border-border text-muted-foreground/40 cursor-not-allowed line-through"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {currentVariant && currentVariant.stock <= 3 && (
                <p className="text-xs text-orange-600 mt-2">Chỉ còn {currentVariant.stock} sản phẩm</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase mb-3">Số lượng</p>
              <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 hover:bg-dwarfs-surface transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2.5 text-sm min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={currentVariant ? quantity >= currentVariant.stock : false}
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
                onClick={() => toggleItem(product)}
                className={cn(
                  "p-3 border transition-all",
                  wishlisted ? "bg-dwarfs-dark text-white border-dwarfs-dark" : "border-border hover:border-dwarfs-dark"
                )}
                aria-label={wishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
              >
                <Heart size={18} className={wishlisted ? "fill-current" : ""} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              {[
                { icon: RotateCcw, title: "Đổi trả lên đến 14 ngày", subtitle: "Áp dụng mọi đơn hàng" },
                { icon: Truck, title: "Vận chuyển toàn quốc", subtitle: "Hỏa tốc Hà Nội - 0876799356" },
                { icon: Tag, title: "Voucher dành riêng", subtitle: "Mua trên Website - Luôn rẻ nhất" },
              ].map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center justify-center w-11 h-11 rounded-full border border-border">
                    <Icon size={18} />
                  </div>
                  <p className="text-xs font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product details — để full-width bên dưới thay vì nhét trong cột phải, đọc dễ hơn nhiều
          (nhất là bảng size/thông số dùng hết bề ngang thay vì bị bó hẹp theo cột). */}
      {sanitizedInfo && (
        <div className="mt-16 border-t border-border pt-10 max-w-4xl mx-auto">
          <h2 className="text-lg font-medium mb-6 text-center">Thông tin sản phẩm</h2>
          <div
            className="text-sm text-muted-foreground leading-relaxed
              [&_h1]:text-foreground [&_h1]:text-xl [&_h1]:font-medium [&_h1]:tracking-tight [&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:first:mt-0
              [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:first:mt-0
              [&_h3]:text-foreground [&_h3]:text-base [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2
              [&_p]:mb-4 [&_p]:last:mb-0
              [&_strong]:text-foreground [&_strong]:font-medium
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1
              [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2
              [&_img]:w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-6 [&_img]:object-cover
              [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:my-6
              [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-dwarfs-surface [&_th]:text-foreground [&_th]:font-medium [&_th]:text-left
              [&_td]:border [&_td]:border-border [&_td]:p-2"
            dangerouslySetInnerHTML={{ __html: sanitizedInfo }}
          />
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20 border-t border-border pt-12">
          <h2 className="text-lg font-medium mb-8">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
